<template>
    <div :class="computedContainerClass" class="stg-uploader">
        <div v-if="type === 'image'">
            <div @click="openUploadFileDialog('image')" class="drop-area" ref="dropAreaImage">
                <input @change="handleUploadFile('image')" ref="dropAreaImageInput" type="file">
                <div class="image-preview" v-if="storedImage">
                    <div class="img-container">
                        <img :src="storedImage" v-if="isPathExist('image')">
                    </div>
                    <div class="img-name" v-if="showImageName('image')">{{}}</div>
                </div>
            </div>
        </div>
        <div v-if="type === 'images'">
            <div @click="openUploadFileDialog('images')" class="drop-area" ref="dropAreaImages">
                <input @change="handleUploadMultipleFiles()" multiple ref="dropAreaImagesInput" type="file">
            </div>
        </div>
        <div v-if="type === 'video'">
            <div @click="openUploadFileDialog('video')" class="drop-area" ref="dropAreaVideo">
                <input @change="handleUploadFile('video')" ref="dropAreaVideoInput" type="file">
            </div>
        </div>

        <div class="uploader-action-text">{{computedActionText}}</div>
    </div>
</template>

<script>
    export default {
        props: {
            settings: {
                type: Object,
                required: true,
                validator: function (value) {
                    let valid = true;
                    let requiredProperties = [
                        'uploadURL',
                        'headers'
                    ];

                    for (let prop of requiredProperties) {
                        if (!value.hasOwnProperty(prop)) {
                            valid = false;
                            break;
                        }
                    }

                    if (!valid) {
                        console.log('%c%s', 'color: red; font: 0.7rem/1 Tahoma;', '(STG-UPLOADER): Неверный формат настроек')
                    }

                    return valid;
                }
            },
            containerClass: {
                type: String,
                required: false
            },
            type: {
                type: String,
                required: true,
                validator: function (value) {
                    return ['image', 'images', 'video'].indexOf(value) !== -1
                }
            },
            images: {
                type: Array[String],
                required: false
            },
            image: {
                type: String,
                required: false
            },
            video: {
                type: String,
                required: false
            },
            actionText: {
                type: String,
                required: false
            }
        },
        mounted() {
            if (this.type === 'image') {
                this.storedImage = this.image
                this.dropArea = this.$refs.dropAreaImage
            }
            if (this.type === 'images') {
                this.storedImages = [...this.storedImages, ...this.images]
                this.dropArea = this.$refs.dropAreaImages
            }
            if (this.type === 'video') {
                this.storedVideo = this.video
                this.dropArea = this.$refs.dropAreaVideo
            }


            this.dropArea.addEventListener('dragenter', this.handleDrop, false)
            this.dropArea.addEventListener('dragleave', this.handleDrop, false)
            this.dropArea.addEventListener('dragover', this.handleDrop, false)
            this.dropArea.addEventListener('drop', this.handleDrop, false)

            ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                this.dropArea.addEventListener(eventName, this.preventDefaultEvents, false)
            })

            ;['dragenter', 'dragover'].forEach(eventName => {
                this.dropArea.addEventListener(eventName, this.highlight, false)
            })

            ;['dragleave', 'drop'].forEach(eventName => {
                this.dropArea.addEventListener(eventName, this.unHighlight, false)
            })
        },
        data: () => ({
            storedImages: [],
            storedImage: null,
            storedVideo: null,
            dropArea: null
        }),
        computed: {
            computedContainerClass() {
                return this.containerClass || null
            },
            computedActionText() {
                return this.actionText || 'Drag&Drop your files'
            }
        },
        methods: {
            preventDefaultEvents(event) {
                event.preventDefault()
                event.stopPropagation()
            },
            handleDrop(event) {
                let dt = event.dataTransfer
                let files = dt.files

                console.log(files);
            },
            highlight() {
                this.dropArea.classList.add('highlight')
            },
            unHighlight() {
                this.dropArea.classList.remove('highlight')
            },
            openUploadFileDialog(type) {
                switch (type) {
                    case 'image':
                        this.$refs.dropAreaImageInput.click()
                        break;
                    case 'images':
                        this.$refs.dropAreaImagesInput.click()
                        break;
                    case 'video':
                        this.$refs.dropAreaVideoInput.click()
                        break;
                    default:
                        break;
                }
            },
            handleUploadMultipleFiles() {
                console.log('images', this.$refs.dropAreaImagesInput.fileList)
            },
            handleUploadFile(type) {
                switch (type) {
                    case 'image':
                        this.handleSingleImage(this.$refs.dropAreaImageInput.files)
                        break;
                    case 'video':
                        console.log('video', this.$refs.dropAreaVideoInput.files)
                        break;
                    default:
                        break;
                }
            },
            handleSingleImage(files) {
                if (files[0]) {
                    let reader = new FileReader()
                    reader.readAsDataURL(files[0])
                    reader.onloadend = () => {
                        this.storedImage = reader.result
                    }
                    this.uploadFile(files[0]);
                }
            },
            showImageName(type) {
                let allowInSettings = this.settings.hasOwnProperty('showFileName') && this.settings.showFileName;
                let nameIsAvailable = false
                switch (type) {
                    case 'image':
                        nameIsAvailable = !!this.storedImage
                        break;
                    case 'images':
                        nameIsAvailable = this.storedImages.length > 0
                        break;
                    case 'video':
                        nameIsAvailable = !!this.storedVideo
                        break;
                    default:
                        break;
                }
                return allowInSettings && nameIsAvailable;
            },
            isPathExist(type) {
                switch (type) {
                    case 'image':
                        return !!this.storedImage
                    case 'video':
                        return !!this.storedVideo
                    default:
                        return false
                }
            },
            uploadFile(file) {
                let url = this.settings.uploadURL
                let xhr = new XMLHttpRequest()
                let formData = new FormData()
                xhr.open('POST', url, true)
                xhr.addEventListener('readystatechange', function (event) {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        console.log(event)
                    } else if (xhr.readyState === 4 && xhr.status !== 200) {
                        console.log(event)
                    }
                })
                formData.append('file', file)
                xhr.send(formData)
            }
        }
    }
</script>


<style>
    .stg-uploader {
        width: 100%;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.2);
        padding: 15px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }

    .stg-uploader .drop-area {
        width: 100%;
        min-height: 150px;
    }

    .stg-uploader .drop-area.highlight {

    }

    .stg-uploader .drop-area input {
        visibility: hidden;
        display: none;
    }

    .stg-uploader .drop-area .image-preview {
        display: flex;
        flex-direction: column;
        width: 150px;
        height: 150px;
        overflow: hidden;
        border-radius: 15px;
    }

    .stg-uploader .drop-area .image-preview .img-container {
        width: 100%;
        height: 100%;
    }

    .stg-uploader .drop-area .image-preview .img-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
    }

    .stg-uploader .uploader-action-text {
        text-align: center;
        color: #000000;
    }
</style>
