// Utilities
export const getCookie = (cName) => {
    const name = `${cName}=`;
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
      if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res
}

export const delegator = (parentSelector, childSelector, eventName, callback) => {
    const parents = document.querySelectorAll(parentSelector);
    for (let parent of parents) {
        parent.addEventListener(eventName, (e) => {
            // console.log(e.target);
            if (e.target.matches(childSelector)) {
                callback(e);
            }
        })
    }
}

export const replacer = (elem, replacement) => {
    if (replacement instanceof HTMLElement) {
        elem.replaceWith(replacement)
    } else {
        const _ = document.createElement('div');
        _.innerHTML = replacement;
        elem.replaceWith(_.firstElementChild);
    }
}

// End Utilities