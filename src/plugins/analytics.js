export default {
  install(Vue) {
    const track = (event, payload = {}) => {
      if (!Vue.$gtag) return;
      Vue.$gtag.event(event, payload);
    };

    const trackFilter = ({ page, filter }) => {
      track('filter_used', {
        page,
        filter_name: filter,
        // filter_value: value
      });
    };

    Vue.prototype.$analytics = {
      track,
      trackFilter
    };
  }
};
