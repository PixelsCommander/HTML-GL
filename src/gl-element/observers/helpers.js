module.exports = {
    isStyleMutation: function(mutation) {
        if (mutation.attributeName === 'style') {
            return true;
        }
    }
};