<template>
    <stg-uploader
            :settings="settings"
            type="video"/>
</template>

<script>
    import Uploader from "./Uploader";

    export default {
        components: {
            'stg-uploader': Uploader
        },
        data: () => ({
            settings: {
                uploadURL: '123',
                headers: [],
                actionText: 'Drag your files'
            }
        })
    }
</script>
