<template>
    <div>
        <stg-uploader
                :settings="settings"
                action-text="Upload single video"
                type="video"/>
        <div class="spacer"></div>
        <stg-uploader
                :settings="settings"
                action-text="Upload single image"
                type="image"/>
        <div class="spacer"></div>
        <stg-uploader
                :settings="settings"
                action-text="Upload multiple images"
                type="images"/>
    </div>
</template>

<script>
    import Uploader from "./Uploader";

    export default {
        components: {
            'stg-uploader': Uploader
        },
        data: () => ({
            settings: {
                uploadURL: 'http://needcar.test/socket-test',
                headers: {
                    Accept: 'application/json'
                },
                actionText: 'Drag your files'
            },
            images: [
                'https://sun9-45.userapi.com/c854328/v854328292/1e023e/CQHwAwfoILA.jpg'
            ]
        })
    }
</script>

<style>
    .spacer {
        height: 30px;
    }
</style>
