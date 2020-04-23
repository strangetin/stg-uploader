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
                <div class="uploaded-files">
                    <div :key="`preview-${index}`" class="image-preview" v-for="(image, index) in storedImages">
                        <div class="img-container">
                            <img :src="image.path">
                        </div>
                        <div :title="image.name" class="img-name">{{image.name}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="type === 'video'">
            <div @click="openUploadFileDialog('video')" class="drop-area" ref="dropAreaVideo">
                <input @change="handleUploadFile('video')" ref="dropAreaVideoInput" type="file">
                <div class="image-preview" v-if="storedVideo">
                    <div class="img-container">
                        <div class="img-container video" v-if="!videoUploaded"></div>
                        <div class="img-container" v-if="videoUploaded">
                            <video :src="storedVideo" v-if="videoUploaded"></video>
                        </div>
                    </div>
                    <div class="img-name" v-if="showImageName('image')">{{}}</div>
                </div>
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
                if (this.image) {
                    this.storedImage = this.image
                }
                this.dropArea = this.$refs.dropAreaImage
            }
            if (this.type === 'images') {
                if (Array.isArray(this.images) && this.images.length > 0) {
                    this.storedImages = [...this.storedImages, ...this.images]
                }
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
            dropArea: null,
            videoUploaded: false,
            availableImagesMime: [
                'image/apng',
                'image/bmp',
                'image/gif',
                'image/x-icon',
                'image/jpeg',
                'image/png',
                'image/svg+xml',
                'image/tiff',
                'image/webp',
                'image/pjpeg',
            ],
            availableVideosMime: [
                'video/mpeg',
                'video/mp4',
                'video/ogg',
                'video/quicktime',
                'video/webm',
                'video/x-ms-wmv',
                'video/x-flv',
                'video/3gpp',
                'video/3gpp2',
            ],
            videoIcon: null
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
                for (let file of this.$refs.dropAreaImagesInput.files) {
                    this.makePreview(file)
                    this.uploadFile(file)
                }
            },
            handleUploadFile(type) {
                switch (type) {
                    case 'image':
                        this.handleSingleImage(this.$refs.dropAreaImageInput.files)
                        break;
                    case 'video':
                        this.handleSingleVideo(this.$refs.dropAreaVideoInput.files)
                        break;
                    default:
                        break;
                }
            },
            makePreview(file) {
                let reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onloadend = () => {
                    this.storedImages.push({
                        path: reader.result,
                        uploaded: false,
                        name: file.name
                    })
                }
            },
            handleSingleImage(files) {
                if (files[0]) {
                    let file = files[0];
                    if (this.availableImagesMime.indexOf(file.type) !== -1) {
                        let reader = new FileReader()
                        reader.readAsDataURL(file)
                        reader.onloadend = () => {
                            this.storedImage = reader.result
                        }
                        this.uploadFile(file, 'image');
                    } else {
                        this.$emit('typeError', `Неверный вормат файла изображения. Допустимые форматы (${this.availableImagesMime.join(', ')})`)
                    }
                }
            },
            handleSingleVideo(files) {
                if (files[0]) {
                    let file = files[0];
                    if (this.availableVideosMime.indexOf(file.type) !== -1) {
                        this.storedVideo = 'processing'
                        this.uploadFile(files[0], 'video');
                    } else {
                        this.$emit('typeError', `Неверный формат файла видео. Допустимые форматы (${this.availableVideosMime.join(', ')})`)
                    }
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
            uploadFile(file, type = null) {
                console.log(file, type)
                // let url = this.settings.uploadURL
                // let xhr = new XMLHttpRequest()
                // let formData = new FormData()
                // xhr.open('POST', url, true)
                // xhr.addEventListener('readystatechange', function (event) {
                //     if (xhr.readyState === 4 && xhr.status === 200) {
                //         console.log(event)
                //     } else if (xhr.readyState === 4 && xhr.status !== 200) {
                //         console.log(event)
                //     }
                // })
                // formData.append('file', file)
                // xhr.send(formData)
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
        margin-right: 30px;
        position: relative;
    }

    .stg-uploader .drop-area .image-preview:last-of-type {
        margin-right: 0;
    }

    .stg-uploader .drop-area .image-preview .img-container {
        width: 100%;
        height: 100%;
    }

    .stg-uploader .drop-area .image-preview .img-name {
        position: absolute;
        max-width: 80%;
        left: 10%;
        bottom: 10px;
        background: #000;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        padding: 3px 10px 3px 10px;
        box-sizing: border-box;
        text-overflow: ellipsis;
        border-radius: 10px;
        text-align: center;
    }

    .stg-uploader .drop-area .image-preview .img-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
    }

    .stg-uploader .drop-area .image-preview .img-container.video {
        background: url("assets/images/video-player.svg") no-repeat center center;
        background-size: contain;
    }

    .stg-uploader .uploader-action-text {
        text-align: center;
        color: #000000;
    }

    .stg-uploader .uploaded-files {
        width: 100%;
        height: 100%;
        display: flex;
    }
</style>
