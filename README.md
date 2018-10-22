# Lazy loading

This app implements lazy loading to load elements (images) only when they appear on the screen. App uses external API.

API used:
https://docs.elderscrollslegends.io/


## Configuration

* limit - maximum amount of all elements
* margin - top and bottom margin to load elements outside viewport expressed in px (recommended 100)
* scrollDelay - delay expressed in milliseconds after scroll event fired (recommended 500 or less)
* container - handler to the container in which the elements will be added (required jQuery object)
* itemClassName - name of extend class for new elements
* errorMessage - error message that will be shown when downloading resources failed