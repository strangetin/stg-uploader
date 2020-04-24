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
                uploadURL: 'https://netcar1.tech-dev.space/api/socket-test/files',
                headers: [],
                actionText: 'Drag your files'
            }
        })
    }
</script>

<style>
    .spacer {
        height: 30px;
    }
</style>
