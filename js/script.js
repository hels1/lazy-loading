const config = {
    limit: 100, //maximum amount of all elements
    margin: 100, //top and bottom margin to load elements outside viewport expressed in px (recommended 100)
    scrollDelay: 500, //delay expressed in milliseconds after scroll event fired (recommended 500 or less)
    container: $('.content'), //handler to the container in which the elements will be added (required jQuery object)
    itemClassName: '', //name of extend class for new elements
    errorMessage: 'Nie udało się pobrać zawartości' //error message that will be shown when downloading resources failed
};

const data = {
    items: [],
    elementObjects: [],
    countInRow: 0,
    countInCol: 0,
    scroll: true
};

$.ajax({
    url: 'https://api.elderscrollslegends.io/v1/cards',
    method: 'GET',
    data: {
        rarity: 'Legendary'
    },
    success: result => {
        if(typeof(result) === 'object' && result.cards.length) {
            let html = '';
            
            for(let [k, v] of result.cards.entries()) {
                if(k >= config.limit) break;

                data.items.push({
                    id: v.id,
                    image: v.imageUrl,
                    title: v.name,
                    loading: false,
                    loaded: false,
                    visible: false
                });
                html += `
                    <div class="item loading ${config.itemClassName}" item-id="${k}">
                        <div class="item-container">
                            <div class="item-front"></div>
                            <div class="item-back"></div>
                        </div>
                    </div>
                `;
            }

            config.container.html(html);
            data.elementObjects = config.container.find('.item');
            setCount();
        } else config.container.html(`<div class="error">${config.errorMessage}</div>`);
    },
    error: error => {
        config.container.html(`<div class="error">${config.errorMessage} (${error.statusText} ${error.status})</div>`);
    }
});

$(window).scroll(() => {
    if(data.scroll) {
        data.scroll = false;
        setTimeout(() => {
            data.scroll = true;
            setLoading();
        }, config.scrollDelay);
    }
}).resize(setCount);

function setCount() {
    if(!data.elementObjects.length) return;

    data.countInRow = Math.floor(config.container.outerWidth() / data.elementObjects.outerWidth());
    data.countInCol = Math.ceil(data.elementObjects.length / data.countInRow);

    setLoading();
}

function setLoading() {
    if(!data.elementObjects.length) return;

    let offset = $(window).scrollTop() - config.container.offset().top;
    let offsetTop = offset - config.margin;
    let offsetBottom = offset + $(window).height() + config.margin;
    let colsTop = Math.floor(offsetTop / data.elementObjects.outerHeight());
    let colsBottom = Math.ceil(offsetBottom / data.elementObjects.outerHeight());
    let startFrom = offsetTop > 0 ? (colsTop >= data.countInCol ? data.elementObjects.length : colsTop * data.countInRow) : 0;
    let endTo = offsetBottom > 0 ? (colsBottom >= data.countInCol ? data.elementObjects.length : colsBottom * data.countInRow) : 0;

    if(startFrom < endTo) setItems(startFrom, endTo);
    else stopLoading();
}

function setItems(from, to) {
    if(!data.items.length) return;
    if(!data.items.some((v, k) => v.loading && from <= k && k < to)) stopLoading();

    for(let i = from; i < to; i++) {
        let d = data.items[i];

        if(!d.loaded) {
            let img = new Image();
            d.loading = true;

            img.onload = () => setVisible(i, 0);
            img.onerror = () => setVisible(i, 1);

            img.src = d.image;
            img.alt = d.title;
            img.className = 'img';
            d.imageObj = img;
        }
    }
}

function setVisible(i, e) {
    if(!data.items.length) return;

    let d = data.items[i];
    d.loading = false;

    if(typeof d.imageObj === 'object' && d.imageObj.src.length) {
        d.loaded = d.visible = true;
        data.elementObjects
            .filter(`[item-id="${i}"]`)
            .removeClass('loading')
            .find('.item-front')
            .html(`${e ? `<div class="empty-card"><div class="error">${config.errorMessage}</div></div>` : `${d.imageObj.outerHTML}`}`);
    }
}

function stopLoading() {
    if(!data.items.length) return;

    for(let v of data.items) {
        if(v.loading) {
            v.loading = false;
            v.imageObj.src = '';
            delete v.imageObj;
        }
    }
}