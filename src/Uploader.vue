<template>
    <div :class="computedContainerClass" class="stg-uploader">
        <div v-if="type === 'image'">
            <div @click="openUploadFileDialog('image')" class="drop-area" ref="dropAreaImage">
                <input @change="handleUploadFile('image')" ref="dropAreaImageInput" type="file">
                <div class="file-list">
                    <div class="file-item">
                        <div class="preview loading" v-if="imageUploading">
                            <loader/>
                        </div>
                        <div class="preview" v-if="showSingleImagePreview">
                            <img :alt="storedImageName" :src="storedImagePath">
                        </div>
                        <div class="file-name" v-if="imageUploading">Wait...</div>
                        <div class="file-name" v-if="showSingleImagePreview">Wait...</div>
                    </div>
                </div>
                <!--                <div class="image-preview" v-if="storedImage">-->
                <!--                    <div class="img-container">-->
                <!--                        <img :src="storedImage" v-if="isPathExist('image')">-->
                <!--                    </div>-->
                <!--                    <div class="img-name" v-if="showImageName('image')">{{image.name}}</div>-->
                <!--                </div>-->
            </div>
        </div>
        <div v-if="type === 'images'">
            <div @click="openUploadFileDialog('images')" class="drop-area" ref="dropAreaImages">
                <input @change="handleUploadMultipleFiles()" multiple ref="dropAreaImagesInput" type="file">
                <!--                <div class="uploaded-files">-->
                <!--                    <div :key="`preview-${index}`" class="image-preview" v-for="(image, index) in storedImages">-->
                <!--                        <div class="img-container">-->
                <!--                            <img :src="image.path">-->
                <!--                        </div>-->
                <!--                        <div :title="image.name" class="img-name">{{image.name}}</div>-->
                <!--                    </div>-->
                <!--                </div>-->
            </div>
        </div>
        <div v-if="type === 'video'">
            <div @click="openUploadFileDialog('video')" class="drop-area" ref="dropAreaVideo">
                <input @change="handleUploadFile('video')" ref="dropAreaVideoInput" type="file">
                <!--                <div class="image-preview" v-if="storedVideo">-->
                <!--                    <div class="img-container">-->
                <!--                        <div class="img-container video" v-if="!videoUploaded"></div>-->
                <!--                        <div class="img-container" v-if="videoUploaded">-->
                <!--                            <video :src="storedVideo" v-if="videoUploaded"></video>-->
                <!--                        </div>-->
                <!--                    </div>-->
                <!--                    <div class="img-name" v-if="showImageName('image')">{{}}</div>-->
                <!--                </div>-->
            </div>
        </div>

        <div class="uploader-action-text">{{computedActionText}}</div>
    </div>
</template>

<script>

    import Loader from './components/Loader'
    import axios from 'axios'

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
        components: {
            loader: Loader
        },
        mounted() {
            if (this.type === 'image') {
                if (this.image) {
                    this.storedImagePath = this.image
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
            storedImagePath: null,
            storedImageFile: null,
            storedImageName: null,
            imageUploading: false,
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
            showSingleImagePreview() {
                return !this.imageUploading && this.storedImageName && this.storedImagePath
            },
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
                        this.handleSingleImage()
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
            handleSingleImage() {
                let files = this.$refs.dropAreaImageInput.files;
                if (files[0]) {
                    let file = files[0];
                    if (this.availableImagesMime.indexOf(file.type) !== -1) {
                        this.imageUploading = true
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
                        nameIsAvailable = !!this.storedImagePath
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
                        return !!this.storedImagePath
                    case 'video':
                        return !!this.storedVideo
                    default:
                        return false
                }
            },
            uploadFile(file, type) {
                let ctx = this;
                this.storedImageName = null
                this.storedImagePath = null
                let url = this.settings.uploadURL
                let formData = new FormData()
                formData.append('file', file)
                axios.post(url,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                ).then(function () {
                    console.log('SUCCESS!!');
                }).catch(function () {
                    if (type === 'image') {
                        ctx.imageUploading = false
                    }
                });
            }
        }
    }
</script>


<style>
    .stg-uploader {
        width: 100%;
        border-radius: 5px;
        border: 2px dotted #e5e5e5;
        transition: .2s linear;
        color: #777;
        padding: 15px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        background-color: #FFffff;
    }

    .stg-uploader:hover {
        background-color: #f6f6f6;
    }

    .stg-uploader .drop-area {
        width: 100%;
        min-height: 150px;
    }

    .stg-uploader .drop-area input {
        visibility: hidden;
        display: none;
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

    .stg-uploader .drop-area .file-list {
        display: flex;
        height: 180px;
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    .stg-uploader .drop-area .file-list .file-item {
        width: 150px;
        height: 100%;
        margin-right: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .stg-uploader .drop-area .file-list .file-item:last-of-type {
        margin-right: 0;
    }

    .stg-uploader .drop-area .file-list .file-item .preview {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 5px;
    }

    .stg-uploader .drop-area .file-list .file-item .preview.loading {
        height: 150px;
        width: 100%;
        display: flex;
    }

    .stg-uploader .drop-area .file-list .file-item .file-name {
        height: 20px;
        width: 100%;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 100%;
        overflow: hidden;
        padding: 0 7px;
    }
</style>
