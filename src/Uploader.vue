<template>
    <div :class="computedContainerClass" class="stg-uploader">
        <div v-if="type === 'image'">
            <div @click="openUploadFileDialog($event, 'image')" class="drop-area" ref="dropAreaImage">
                <input @change="handleUploadFile('image')" ref="dropAreaImageInput" type="file">
                <div class="file-list">
                    <div class="file-item">
                        <div class="preview loading" v-if="imageUploading">
                            <span class="loader">
                                <span class="loader-inner"></span>
                            </span>
                        </div>
                        <div class="preview" v-if="showSingleImagePreview">
                            <img :alt="storedImageName" :src="storedImagePath">
                            <div @click.prevent="removeSingleFile('image')" class="remove-item">&times;</div>
                        </div>
                        <div class="file-name" v-if="imageUploading">Wait...</div>
                        <div class="file-name" v-if="showSingleImagePreview">{{storedImageName}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="type === 'images'">
            <div @click="openUploadFileDialog($event, 'images')" class="drop-area" ref="dropAreaImages">
                <input @change="handleUploadMultipleFiles()" multiple ref="dropAreaImagesInput" type="file">
                <div class="file-list">
                    <div :key="`image-${image.id}`" class="file-item" v-for="image in storedImages">
                        <div class="preview loading" v-if="!image.uploaded">
                            <span class="loader">
                                <span class="loader-inner"></span>
                            </span>
                        </div>
                        <div class="preview" v-if="image.uploaded">
                            <img :alt="image.name" :src="image.path">
                            <div @click.prevent="removeImageFromList(image)" class="remove-item">&times;</div>
                        </div>
                        <div class="file-name" v-if="!image.uploaded">Wait...</div>
                        <div class="file-name" v-if="image.uploaded && image.name">{{image.name}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="type === 'video'">
            <div @click="openUploadFileDialog($event, 'video')" class="drop-area" ref="dropAreaVideo">
                <input @change="handleUploadFile('video')" ref="dropAreaVideoInput" type="file">
                <div class="file-list">
                    <div class="file-item">
                        <div class="preview loading" v-if="videoUploading">
                            <span class="loader">
                                <span class="loader-inner"></span>
                            </span>
                        </div>
                        <div class="preview video" v-if="showSingleVideoPreview">
                            <video :src="storedVideoPath" autoplay="autoplay" loop="loop" muted="muted"></video>
                            <div @click.prevent="removeSingleFile('image')" class="remove-item">&times;</div>
                        </div>
                        <div class="file-name" v-if="videoUploading">Wait...</div>
                        <div class="file-name" v-if="showSingleVideoPreview">{{storedVideoName}}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="uploader-action-text">{{computedActionText}}</div>
    </div>
</template>

<script>

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

        mounted() {
            if (this.type === 'image') {
                if (this.image) {
                    this.storedImagePath = this.image
                }
                this.dropArea = this.$refs.dropAreaImage
            }
            if (this.type === 'images') {
                if (Array.isArray(this.images) && this.images.length > 0) {
                    for (let image of this.images) {
                        this.storedImages.push({
                            id: this.storedImages.length + 1,
                            name: this.getFileNameFromLink(image),
                            path: image,
                            uploaded: true
                        })
                    }
                }
                this.dropArea = this.$refs.dropAreaImages
            }
            if (this.type === 'video') {
                this.storedVideo = this.video
                this.dropArea = this.$refs.dropAreaVideo
            }

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
            videoUploading: false,
            storedVideoPath: null,
            storedVideoName: null,
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
                'video/mp4',
                'video/ogg',
                'video/quicktime',
                'video/webm'
            ],
            videoIcon: null
        }),
        computed: {
            showSingleImagePreview() {
                return !this.imageUploading && this.storedImageName && this.storedImagePath
            },
            showSingleVideoPreview() {
                return !this.videoUploading && this.storedVideoName && this.storedVideoPath
            },
            computedContainerClass() {
                return this.containerClass || null
            },
            computedActionText() {
                return this.actionText || 'Drag&Drop your files'
            }
        },
        methods: {
            removeImageFromList(image) {
                this.storedImages = this.storedImages.filter(item => {
                    return item.id !== image.id
                })
                this.$emit('fileDeleted', image.path)
            },
            removeSingleFile(type) {
                switch (type) {
                    case 'image':
                        this.$emit('fileDeleted', this.storedImagePath)
                        this.resetSingleImage()
                        break;
                    case 'video':
                        this.$emit('fileDeleted', this.storedVideoPath)
                        this.resetSingleVideo()
                        break;
                }
            },
            getFileNameFromLink(link) {
                if (link) {
                    let m = link.toString().match(/.*\/(.+?)\./);
                    if (m && m.length > 1) {
                        return m[1];
                    }
                }
                return "";
            },
            preventDefaultEvents(event) {
                event.preventDefault()
                event.stopPropagation()
            },
            handleDrop(event) {
                let dt = event.dataTransfer
                let files = dt.files


                if (files.length > 0) {
                    switch (this.type) {
                        case 'image':
                            if (this.imageUploading) {
                                alert("Wait... Uploading is progress");
                            } else {
                                this.handleSingleImage(files)
                            }
                            break;
                        case 'images':
                            if (this.storedImages.filter(item => !item.uploaded).length > 0) {
                                alert("Wait... Uploading is progress");
                            } else {
                                this.handleUploadMultipleFiles(files)
                            }
                            break;
                        case 'video':
                            if (this.videoUploading) {
                                alert("Wait... Uploading is progress");
                            } else {
                                this.handleSingleVideo(files)
                            }
                            break;
                    }
                }
            },
            highlight() {
                this.dropArea.classList.add('highlight')
            },
            unHighlight() {
                this.dropArea.classList.remove('highlight')
            },
            openUploadFileDialog(event, type) {
                let exceptingClasses = [
                    'remove-item'
                ];
                for (let className of exceptingClasses) {
                    if (event.target.className.replace(/[\n\t]/g, " ").indexOf(className) > -1) {
                        return;
                    }
                }
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
            handleUploadMultipleFiles(drop = null) {
                let files = this.$refs.dropAreaImagesInput.files;
                if (drop) {
                    files = drop
                }
                if (files.length > 0) {
                    for (let file of files) {
                        let newImage = {
                            id: this.storedImages.length + 1,
                            name: file.name,
                            uploaded: false,
                            path: null
                        };
                        this.storedImages.push(newImage)
                        this.uploadFile(file, 'images', newImage)
                    }
                }
            },
            handleUploadFile(type) {
                switch (type) {
                    case 'image':
                        this.handleSingleImage()
                        break;
                    case 'video':
                        this.handleSingleVideo()
                        break;
                    default:
                        break;
                }
            },
            handleSingleImage(drop = null) {
                let files = this.$refs.dropAreaImageInput.files;
                if (drop) {
                    files = drop
                }
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
            handleSingleVideo(drop = null) {
                let files = this.$refs.dropAreaVideoInput.files;
                if (drop) {
                    files = drop
                }
                if (files[0]) {
                    let file = files[0];
                    if (this.availableVideosMime.indexOf(file.type) !== -1) {
                        this.videoUploading = true
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
            setSingleImage(path, fileName) {
                this.storedImagePath = path
                this.storedImageName = fileName
                this.imageUploading = false
                this.$emit('uploadSuccess', path)
            },
            resetSingleImage(error = null) {
                if (error) {
                    this.$emit('uploadError', error)
                }
                this.storedImagePath = null
                this.storedImageName = null
                this.imageUploading = false
            },
            setSingleImageFromList(path, fileName, storedImage) {
                this.storedImages = this.storedImages.filter(item => {
                    return item.id !== storedImage.id
                })
                storedImage.path = path
                storedImage.name = fileName
                storedImage.uploaded = true
                this.storedImages.push(storedImage)
                this.$emit('uploadSuccess', path)
            },
            resetSingleImageFromList(error = null, id) {
                if (error) {
                    this.$emit('uploadError', error)
                }
                this.storedImages = this.storedImages.filter(item => {
                    return item.id !== id
                })
            },
            setSingleVideo(path, fileName) {
                this.storedVideoPath = path
                this.storedVideoName = fileName
                this.videoUploading = false
                this.$emit('uploadSuccess', path)
            },
            resetSingleVideo(error = null) {
                if (error) {
                    this.$emit('uploadError', error)
                }
                this.storedVideoPath = null
                this.storedVideoName = null
                this.videoUploading = false
            },
            uploadFile(file, type, options = null) {
                this.storedImageName = null
                this.storedImagePath = null
                let url = this.settings.uploadURL
                let formData = new FormData()
                formData.append('file', file)
                let headers = {};
                headers = {...headers, ...this.headers}

                axios.post(url,
                    formData,
                    {
                        headers: headers
                    }
                ).then(data => {
                    if (type === 'image') {
                        this.setSingleImage(data.data, file.name)
                    }
                    if (type === 'images') {
                        this.setSingleImageFromList(data.data, file.name, options)
                    }
                    if (type === 'video') {
                        this.setSingleVideo(data.data, file.name)
                    }
                }).catch(error => {
                    if (type === 'image') {
                        this.resetSingleImage(error)
                    }
                    if (type === 'images') {
                        this.resetSingleImageFromList(error, options.id)
                    }
                    if (type === 'video') {
                        this.resetSingleVideo(error)
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

    .stg-uploader * {
        user-select: none;
    }

    .stg-uploader:hover {
        background-color: #f6f6f6;
    }

    .stg-uploader .drop-area {
        width: 100%;
        min-height: 150px;
    }

    .stg-uploader .drop-area.highlight .file-list:before {
        content: 'Drop here';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(150, 150, 150, 0.9);
        font-size: 32px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        border: 1px solid rgba(150, 150, 150, 0.7);
        border-radius: 10px;
        box-sizing: border-box;
        padding: 0;
        margin: 0;
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
        margin: 0;
        padding: 0 0 10px 0;
        overflow-x: auto;
        position: relative;
    }

    .stg-uploader .drop-area .file-list .file-item {
        width: 150px;
        min-width: 150px;
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
        width: 100%;
        height: 150px;
        overflow: hidden;
        position: relative;
    }

    .stg-uploader .drop-area .file-list .file-item .preview .remove-item {
        position: absolute;
        right: 10px;
        top: 10px;
        font-size: 18px;
        width: 16px;
        height: 16px;
        cursor: pointer;
        line-height: 13px;
        text-align: center;
        box-sizing: border-box;
    }

    .stg-uploader .drop-area .file-list .file-item .preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
    }

    .stg-uploader .drop-area .file-list .file-item .preview.video {
        display: flex;
    }

    .stg-uploader .drop-area .file-list .file-item .preview.video video {
        width: 100%;
        height: 100%;
        margin: auto;
        object-fit: cover;
    }

    .stg-uploader .drop-area .file-list .file-item .preview.loading {
        display: flex;
    }

    .stg-uploader .drop-area .file-list .file-item .preview.loading .loader {
        display: inline-block;
        width: 30px;
        height: 30px;
        position: relative;
        border: 4px solid #Fff;
        animation: loader 2s infinite ease;
        margin: auto;
    }

    .stg-uploader .drop-area .file-list .file-item .preview.loading .loader-inner {
        vertical-align: top;
        display: inline-block;
        width: 100%;
        background-color: #fff;
        animation: loader-inner 2s infinite ease-in;
    }

    @keyframes loader {
        0% {
            transform: rotate(0deg);
        }

        25% {
            transform: rotate(180deg);
        }

        50% {
            transform: rotate(180deg);
        }

        75% {
            transform: rotate(360deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    @keyframes loader-inner {
        0% {
            height: 0;
        }

        25% {
            height: 0;
        }

        50% {
            height: 100%;
        }

        75% {
            height: 100%;
        }

        100% {
            height: 0;
        }
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
        box-sizing: border-box;
    }
</style>
