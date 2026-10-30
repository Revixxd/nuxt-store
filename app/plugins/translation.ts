export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    useHead({
      script: [
        {
          key: 'translation-script',
          innerHTML: `
            (function(g,e,o,t,a,r,ge,tl,y){
            t=g.getElementsByTagName(o)[0];y=g.createElement(e);y.async=true;
            y.src='https://g594253005.co/geotranslate?id=-P5B083uo8pZ547BbwpU&refurl='+g.referrer+'&winurl='+encodeURIComponent(window.location)+'&navigatorlang='+(navigator.language || navigator.userLanguage || '');
            t.parentNode.insertBefore(y,t);
            })(document,'script','head');
          `,
        },
      ],
    })
}})

// (function(g,e,o,t,a,r,ge,tl,y){
//   t=g.getElementsByTagName(o)[0];y=g.createElement(e);y.async=true;
//   y.src='https://g594253005.co/geotranslate?id=-P5B083uo8pZ547BbwpU&refurl='+g.referrer+'&winurl='+encodeURIComponent(window.location)+'&navigatorlang='+(navigator.language || navigator.userLanguage || '');
//   t.parentNode.insertBefore(y,t);
//   })

// <script>
//   (function(g,e,o,t,a,r,ge,tl,y){
//   t=g.getElementsByTagName(o)[0];y=g.createElement(e);y.async=true;
//   y.src='https://g594253005.co/geotranslate?id=-P5B083uo8pZ547BbwpU&refurl='+g.referrer+'&winurl='+encodeURIComponent(window.location)+'&navigatorlang='+(navigator.language || navigator.userLanguage || '');
//   t.parentNode.insertBefore(y,t);
//   })(document,'script','head');
// </script>