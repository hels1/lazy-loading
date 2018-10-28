/* Lazy loading v2 */

const config = {
    limit: 100, /* maximum amount of all elements */
    margin: 100, /* top and bottom margin to load elements outside viewport expressed in px (recommended 100) */
    scrollDelay: 500, /* delay expressed in milliseconds after scroll event fired (recommended 500 or less) */
    container: document.querySelector('.content'), /* handler to the container in which the elements will be added */
    itemClassName: '', /* name of extend one or more classes for new elements */
    errorMessage: 'Nie udało się pobrać zawartości', /* error message that will be shown when downloading resources failed */
    breakpoints: [ /* each breakpoint is related to another image */
        {to: 800},
        {from: 801}
    ]
};

const data = {
    items: [],
    elementObjects: [],
    countInRow: 0,
    countInCol: 0,
    imageIndex: 0,
    scroll: true
};

fetch('https://b2c-www.redefine.pl/rpc/navigation/', {
    method: 'POST',
    body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'getCategoryContentWithFlatNavigation',
        params: {
            catid: 759,
            limit: config.limit,
            clientId: '"c921d668-1fdc-4e71-b15e-e8338d2c9bb2',
            ua: `www_iplatv/12345 (${navigator.userAgent})`
        }
    })
}).then(r => {
    if(r.ok) return r.json();
    else throw new Error('Wrong response');
}).then(r => {
    if(typeof(r) === 'object' && r.result.results.length) {
        let html = '';
        
        for(let [k, v] of r.result.results.entries()) {
            data.items.push({
                id: v.id,
                title: v.title,
                images: [v.thumbnails[0].src, v.thumbnails[3].src],
                brokenImages: [],
                loading: false,
                loaded: false
            });
            html += `
                <div class="item loading ${config.itemClassName}" item-id="${k}">
                    <div class="item-container">
                        <div class="item-front"></div>
                        <div class="item-back"></div>
                    </div>
                    <div class="item-title">${v.title}</div>
                </div>
            `;
        }

        config.container.innerHTML = html;
        data.elementObjects = config.container.querySelectorAll('.item');
        setCount();
    } else throw new Error('Incorrect data');
}).catch(e => {
    config.container.innerHTML = `<div class="error">${config.errorMessage} <br /> ${e}</div>`;
});

window.onscroll = () => {
    if(data.scroll) {
        data.scroll = false;
        setTimeout(() => {
            data.scroll = true;
            setLoading();
        }, config.scrollDelay);
    }
};
window.onresize = setCount;

function setCount() {
    if(!data.elementObjects.length) return;

    data.countInRow = Math.floor(config.container.offsetWidth / data.elementObjects[0].offsetWidth);
    data.countInCol = Math.ceil(data.elementObjects.length / data.countInRow);

    setImageIndex();
    setLoading();
}

function setImageIndex() {
    for(let [k, v] of config.breakpoints.entries()) {
        if((typeof v.from === 'undefined' || (v.from >= 0 && v.from <= window.innerWidth)) && (typeof v.to === 'undefined' || (v.to >= 0 && v.to >= window.innerWidth))) {
            data.imageIndex = k;
            break;
        }
    }
}

function setLoading() {
    if(!data.elementObjects.length) return;

    let offset = window.scrollY - config.container.offsetTop;
    let offsetTop = offset - config.margin;
    let offsetBottom = offset + window.innerHeight + config.margin;
    let rowsTop = Math.floor(offsetTop / data.elementObjects[0].offsetHeight);
    let rowsBottom = Math.ceil(offsetBottom / data.elementObjects[0].offsetHeight);
    let from = offsetTop > 0 ? (rowsTop >= data.countInCol ? data.elementObjects.length : rowsTop * data.countInRow) : 0;
    let to = offsetBottom > 0 ? (rowsBottom >= data.countInCol ? data.elementObjects.length : rowsBottom * data.countInRow) : 0;

    if(from < to) {
        stopLoading([from, to]);
        for(let i = from; i < to; i++) startLoading(i);
    } else stopLoading();
}

function startLoading(i, imageIndex = data.imageIndex) {
    let d = data.items[i];

    if((typeof d.imageObj === 'object' && d.images[imageIndex] != d.imageObj.src && d.brokenImages.indexOf(d.images[imageIndex]) < 0)) d.loaded = false;
    
    if(!d.loaded) {
        let img = new Image();
        d.loading = true;
        data.elementObjects[i].classList.add('loading');

        img.onload = () => setVisible(i, 0);
        img.onerror = () => {
            if(typeof d.imageObj === 'object') {
                let newImageIndex = 0;
                d.brokenImages.push(d.imageObj.src);

                for(let x = imageIndex + 1; x < d.images.length; x++) {
                    if(d.brokenImages.indexOf(d.images[x]) < 0) {
                        newImageIndex = x;
                        break;
                    }
                }
                if(newImageIndex) startLoading(i, newImageIndex);
                else setVisible(i, 1);
            }
        };

        img.alt = d.title;
        img.className = 'img';
        img.src = d.images[imageIndex];
        d.imageObj = img;
    }
}

function setVisible(i, e) {
    if(!data.items.length) return;

    if(typeof data.items[i].imageObj === 'object' || e) {
        data.items[i].loaded = true;
        data.items[i].loading = false;
        data.elementObjects[i].querySelector('.item-front').innerHTML = e ? `<div class="empty-card"><div class="error">${config.errorMessage}</div></div>` : data.items[i].imageObj.outerHTML;
        data.elementObjects[i].classList.remove('loading');
    }
}

function stopLoading(except = [], all = false) {
    if(!data.items.length) return;

    for(let [k, v] of data.items.entries()) {
        if(v.loading || all) {
            if(except.length && except[0] <= k && except[1] > k) continue;

            v.loading = v.loaded = false;
            v.imageObj.src = '';
            delete v.imageObj;
        }
    }
}