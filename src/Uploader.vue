<template>
    <div :class="computedContainerClass" class="stg-uploader">
        <div v-if="type === 'image'">
            <div class="drop-area" ref="dropAreaImage"></div>
        </div>
        <div v-if="type === 'images'">
            <div class="drop-area" ref="dropAreaImages"></div>
        </div>
        <div v-if="type === 'video'">
            <div class="drop-area" ref="dropAreaVideo"></div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            containerClass: {
                type: String,
                required: false
            },
            type: {
                type: String,
                validator: function (value) {
                    return ['image', 'images', 'video'].indexOf(value) !== -1
                }
            },
            images: {
                type: Array[String]
            },
            image: {
                type: String
            },
            video: {
                type: String
            }
        },
        mounted() {
            if (this.type === 'image') {
                this.storedImage = this.image
            }
            if (this.type === 'images') {
                this.storedImages = [...this.storedImages, ...this.images]
            }
            if (this.type === 'video') {
                this.storedVideo = this.video
            }
        },
        data: () => ({
            storedImages: [],
            storedImage: null,
            storedVideo: null
        }),
        computed: {
            computedContainerClass() {
                return this.containerClass || null
            }
        },
        methods() {

        },
        watch: {
            images: {
                handler(value) {
                    if (this.type === 'images' && value && typeof this.data === 'undefined') {
                        console.error("Property 'images' required if you select type 'images'")
                    }
                },
                immediate: true
            },
            image: {
                handler(value) {
                    if (this.type === 'image' && value && typeof this.data === 'undefined') {
                        console.error("Property 'image' required if you select type 'image'")
                    }
                },
                immediate: true
            },
            video: {
                handler(value) {
                    if (this.type === 'video' && value && typeof this.data === 'undefined') {
                        console.error("Property 'video' required if you select type 'video'")
                    }
                },
                immediate: true
            }
        }
    }
</script>


<style>
    .stg-uploader {
        width: 100%;
    }

    .stg-uploader .drop-area {
        width: 100%;
        min-height: 100px;
        background: gray;
    }
</style>
