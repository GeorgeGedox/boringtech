const sitePreference = document.documentElement.getAttribute("data-default-appearance");
const userPreference = localStorage.getItem("appearance");

if ((sitePreference === "dark" && userPreference === null) || userPreference === "dark") {
  document.documentElement.classList.add("dark");
}

if (document.documentElement.getAttribute("data-auto-appearance") === "true") {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches &&
    userPreference !== "light"
  ) {
    document.documentElement.classList.add("dark");
  }
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (event.matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });
}

window.addEventListener("DOMContentLoaded", (event) => {
  const switcher = document.getElementById("appearance-switcher");
  const switcherMobile = document.getElementById("appearance-switcher-mobile");

  updateMeta();
  this.updateLogo?.(getTargetAppearance());
  {{ if .Params.showComments | default (.Site.Params.article.showComments | default false) }}
  changeGiscusTheme();
  {{ end }}

  if (switcher) {
    switcher.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      var targetAppearance = getTargetAppearance();
      localStorage.setItem(
        "appearance",
        targetAppearance
      );
      updateMeta();
      this.updateLogo?.(targetAppearance);
      {{ if .Params.showComments | default (.Site.Params.article.showComments | default false) }}
      changeGiscusTheme();
      {{ end }}
    });
    switcher.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      localStorage.removeItem("appearance");
    });
  }
  if (switcherMobile) {
    switcherMobile.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      var targetAppearance = getTargetAppearance();
      localStorage.setItem(
        "appearance",
        targetAppearance
      );
      updateMeta();
      this.updateLogo?.(targetAppearance);
      {{ if .Params.showComments | default (.Site.Params.article.showComments | default false) }}
      changeGiscusTheme();
      {{ end }}
    });
    switcherMobile.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      localStorage.removeItem("appearance");
    });
  }
});


var updateMeta = () => {
  var elem, style;
  elem = document.querySelector('body');
  style = getComputedStyle(elem);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', style.backgroundColor);
}

{{ if and (.Site.Params.Logo) (.Site.Params.SecondaryLogo) }}
{{ $primaryLogo := resources.Get .Site.Params.Logo }}
{{ $secondaryLogo := resources.Get .Site.Params.SecondaryLogo }}
{{ $primaryLogo := $primaryLogo.Resize (printf "%dx%d png" $primaryLogo.Width $primaryLogo.Height) }}
{{ $secondaryLogo := $secondaryLogo.Resize (printf "%dx%d png" $secondaryLogo.Width $secondaryLogo.Height) }}
{{ if and ($primaryLogo) ($secondaryLogo) }}
var updateLogo = (targetAppearance) => {
  var elems;
  elems = document.querySelectorAll("img.logo")
  targetLogoPath =
    targetAppearance == "{{ .Site.Params.DefaultAppearance }}" ?
    "{{ $primaryLogo.RelPermalink }}" : "{{ $secondaryLogo.RelPermalink }}"
  for (const elem of elems) {
    elem.setAttribute("src", targetLogoPath)
  }
}
{{ end }}
{{- end }}

var getTargetAppearance = () => {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

window.addEventListener("DOMContentLoaded", (event) => {
  const scroller = document.getElementById("top-scroller");
  const footer = document.getElementById("site-footer");
  if(scroller && footer && scroller.getBoundingClientRect().top > footer.getBoundingClientRect().top) {
    scroller.hidden = true;
  }
});

{{ if .Params.showComments | default (.Site.Params.article.showComments | default false) }}
function changeGiscusTheme() {
  const theme = document.documentElement.classList.contains("dark") ? "{{ .Site.Params.comments.theme_dark }}" : "{{ .Site.Params.comments.theme_light }}"

  function sendMessage(message) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;
    iframe.contentWindow.postMessage({ giscus: message }, 'https://giscus.app');
  }

  sendMessage({
    setConfig: {
      theme: theme
    }
  });
}
{{ end }}
