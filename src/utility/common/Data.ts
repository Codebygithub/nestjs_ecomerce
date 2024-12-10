export const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el =>[el,1]))
}

export const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(el =>[el,0]))
}