# Lazy loading

This app implements lazy loading to load elements (images) only when they appear on the screen. App uses external API.



## v1

Created with jQuery.

API used:
https://docs.elderscrollslegends.io/


### Configuration

* limit - maximum amount of all elements
* margin - top and bottom margin to load elements outside viewport expressed in px (recommended 100)
* scrollDelay - delay expressed in milliseconds after scroll event fired (recommended 500 or less)
* container - handler to the container in which the elements will be added (required jQuery object)
* itemClassName - name of extend class for new elements
* errorMessage - error message that will be shown when downloading resources failed



## v2

### Changes

* pure JavaScript (ES6)
* IPLA API
* added title to each element
* downloading images related to breakpoints
* download image in higher available breakpoint if image can't be downloaded in current breakpoint
* code update


### Changes in configuration

* container - handler to the container in which the elements will be added
* breakpoints - each breakpoint is related to another image