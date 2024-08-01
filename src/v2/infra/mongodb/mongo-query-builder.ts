export const or = (...params: any) => {
    return { $or: params };
}

export const notIn = (...values: any) => {
    return { $nin: values };
}


