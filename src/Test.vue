<template>
    <stg-uploader
            :settings="settings"
            type="image"/>
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
