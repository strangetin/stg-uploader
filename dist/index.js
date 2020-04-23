/*!
 * stg-uploader v1.1.4
 * (c) Strange Tin
 * Released under the MIT License.
 */
'use strict';

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o) {
  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) {
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var it,
      normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = o[Symbol.iterator]();
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script = {
  props: {
    settings: {
      type: Object,
      required: true,
      validator: function validator(value) {
        var valid = true;
        var requiredProperties = ['uploadURL', 'headers'];

        for (var _i = 0, _requiredProperties = requiredProperties; _i < _requiredProperties.length; _i++) {
          var prop = _requiredProperties[_i];

          if (!value.hasOwnProperty(prop)) {
            valid = false;
            break;
          }
        }

        if (!valid) {
          console.log('%c%s', 'color: red; font: 0.7rem/1 Tahoma;', '(STG-UPLOADER): Неверный формат настроек');
        }

        return valid;
      }
    },
    containerClass: {
      type: String,
      required: false
    },
    type: {
      type: String,
      required: true,
      validator: function validator(value) {
        return ['image', 'images', 'video'].indexOf(value) !== -1;
      }
    },
    images: {
      type: Array[String],
      required: false
    },
    image: {
      type: String,
      required: false
    },
    video: {
      type: String,
      required: false
    },
    actionText: {
      type: String,
      required: false
    }
  },
  mounted: function mounted() {
    var _this = this;

    if (this.type === 'image') {
      if (this.image) {
        this.storedImage = this.image;
      }

      this.dropArea = this.$refs.dropAreaImage;
    }

    if (this.type === 'images') {
      if (Array.isArray(this.images) && this.images.length > 0) {
        this.storedImages = [].concat(_toConsumableArray(this.storedImages), _toConsumableArray(this.images));
      }

      this.dropArea = this.$refs.dropAreaImages;
    }

    if (this.type === 'video') {
      this.storedVideo = this.video;
      this.dropArea = this.$refs.dropAreaVideo;
    }

    this.dropArea.addEventListener('dragenter', this.handleDrop, false);
    this.dropArea.addEventListener('dragleave', this.handleDrop, false);
    this.dropArea.addEventListener('dragover', this.handleDrop, false);
    this.dropArea.addEventListener('drop', this.handleDrop, false);
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName) {
      _this.dropArea.addEventListener(eventName, _this.preventDefaultEvents, false);
    });
    ['dragenter', 'dragover'].forEach(function (eventName) {
      _this.dropArea.addEventListener(eventName, _this.highlight, false);
    });
    ['dragleave', 'drop'].forEach(function (eventName) {
      _this.dropArea.addEventListener(eventName, _this.unHighlight, false);
    });
  },
  data: function data() {
    return {
      storedImages: [],
      storedImage: null,
      storedVideo: null,
      dropArea: null,
      videoUploaded: false,
      availableImagesMime: ['image/apng', 'image/bmp', 'image/gif', 'image/x-icon', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/tiff', 'image/webp', 'image/pjpeg'],
      availableVideosMime: ['video/mpeg', 'video/mp4', 'video/ogg', 'video/quicktime', 'video/webm', 'video/x-ms-wmv', 'video/x-flv', 'video/3gpp', 'video/3gpp2'],
      videoIcon: null
    };
  },
  computed: {
    computedContainerClass: function computedContainerClass() {
      return this.containerClass || null;
    },
    computedActionText: function computedActionText() {
      return this.actionText || 'Drag&Drop your files';
    }
  },
  methods: {
    preventDefaultEvents: function preventDefaultEvents(event) {
      event.preventDefault();
      event.stopPropagation();
    },
    handleDrop: function handleDrop(event) {
      var dt = event.dataTransfer;
      var files = dt.files;
      console.log(files);
    },
    highlight: function highlight() {
      this.dropArea.classList.add('highlight');
    },
    unHighlight: function unHighlight() {
      this.dropArea.classList.remove('highlight');
    },
    openUploadFileDialog: function openUploadFileDialog(type) {
      switch (type) {
        case 'image':
          this.$refs.dropAreaImageInput.click();
          break;

        case 'images':
          this.$refs.dropAreaImagesInput.click();
          break;

        case 'video':
          this.$refs.dropAreaVideoInput.click();
          break;
      }
    },
    handleUploadMultipleFiles: function handleUploadMultipleFiles() {
      var _iterator = _createForOfIteratorHelper(this.$refs.dropAreaImagesInput.files),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var file = _step.value;
          this.makePreview(file);
          this.uploadFile(file);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    handleUploadFile: function handleUploadFile(type) {
      switch (type) {
        case 'image':
          this.handleSingleImage(this.$refs.dropAreaImageInput.files);
          break;

        case 'video':
          this.handleSingleVideo(this.$refs.dropAreaVideoInput.files);
          break;
      }
    },
    makePreview: function makePreview(file) {
      var _this2 = this;

      var reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = function () {
        _this2.storedImages.push({
          path: reader.result,
          uploaded: false,
          name: file.name
        });
      };
    },
    handleSingleImage: function handleSingleImage(files) {
      var _this3 = this;

      if (files[0]) {
        var file = files[0];

        if (this.availableImagesMime.indexOf(file.type) !== -1) {
          var reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onloadend = function () {
            _this3.storedImage = reader.result;
          };

          this.uploadFile(file, 'image');
        } else {
          this.$emit('typeError', "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u043E\u0440\u043C\u0430\u0442 \u0444\u0430\u0439\u043B\u0430 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F. \u0414\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0435 \u0444\u043E\u0440\u043C\u0430\u0442\u044B (".concat(this.availableImagesMime.join(', '), ")"));
        }
      }
    },
    handleSingleVideo: function handleSingleVideo(files) {
      if (files[0]) {
        var file = files[0];

        if (this.availableVideosMime.indexOf(file.type) !== -1) {
          this.storedVideo = 'processing';
          this.uploadFile(files[0], 'video');
        } else {
          this.$emit('typeError', "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u0444\u0430\u0439\u043B\u0430 \u0432\u0438\u0434\u0435\u043E. \u0414\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0435 \u0444\u043E\u0440\u043C\u0430\u0442\u044B (".concat(this.availableVideosMime.join(', '), ")"));
        }
      }
    },
    showImageName: function showImageName(type) {
      var allowInSettings = this.settings.hasOwnProperty('showFileName') && this.settings.showFileName;
      var nameIsAvailable = false;

      switch (type) {
        case 'image':
          nameIsAvailable = !!this.storedImage;
          break;

        case 'images':
          nameIsAvailable = this.storedImages.length > 0;
          break;

        case 'video':
          nameIsAvailable = !!this.storedVideo;
          break;
      }

      return allowInSettings && nameIsAvailable;
    },
    isPathExist: function isPathExist(type) {
      switch (type) {
        case 'image':
          return !!this.storedImage;

        case 'video':
          return !!this.storedVideo;

        default:
          return false;
      }
    },
    uploadFile: function uploadFile(file) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      console.log(file, type); // let url = this.settings.uploadURL
      // let xhr = new XMLHttpRequest()
      // let formData = new FormData()
      // xhr.open('POST', url, true)
      // xhr.addEventListener('readystatechange', function (event) {
      //     if (xhr.readyState === 4 && xhr.status === 200) {
      //         console.log(event)
      //     } else if (xhr.readyState === 4 && xhr.status !== 200) {
      //         console.log(event)
      //     }
      // })
      // formData.append('file', file)
      // xhr.send(formData)
    }
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "stg-uploader",
    "class": _vm.computedContainerClass
  }, [_vm.type === 'image' ? _c('div', [_c('div', {
    ref: "dropAreaImage",
    staticClass: "drop-area",
    on: {
      "click": function click($event) {
        return _vm.openUploadFileDialog('image');
      }
    }
  }, [_c('input', {
    ref: "dropAreaImageInput",
    attrs: {
      "type": "file"
    },
    on: {
      "change": function change($event) {
        return _vm.handleUploadFile('image');
      }
    }
  }), _vm._v(" "), _vm.storedImage ? _c('div', {
    staticClass: "image-preview"
  }, [_c('div', {
    staticClass: "img-container"
  }, [_vm.isPathExist('image') ? _c('img', {
    attrs: {
      "src": _vm.storedImage
    }
  }) : _vm._e()]), _vm._v(" "), _vm.showImageName('image') ? _c('div', {
    staticClass: "img-name"
  }, [_vm._v("{{}}")]) : _vm._e()]) : _vm._e()])]) : _vm._e(), _vm._v(" "), _vm.type === 'images' ? _c('div', [_c('div', {
    ref: "dropAreaImages",
    staticClass: "drop-area",
    on: {
      "click": function click($event) {
        return _vm.openUploadFileDialog('images');
      }
    }
  }, [_c('input', {
    ref: "dropAreaImagesInput",
    attrs: {
      "multiple": "",
      "type": "file"
    },
    on: {
      "change": function change($event) {
        return _vm.handleUploadMultipleFiles();
      }
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "uploaded-files"
  }, _vm._l(_vm.storedImages, function (image, index) {
    return _c('div', {
      key: "preview-" + index,
      staticClass: "image-preview"
    }, [_c('div', {
      staticClass: "img-container"
    }, [_c('img', {
      attrs: {
        "src": image.path
      }
    })]), _vm._v(" "), _c('div', {
      staticClass: "img-name",
      attrs: {
        "title": image.name
      }
    }, [_vm._v(_vm._s(image.name))])]);
  }), 0)])]) : _vm._e(), _vm._v(" "), _vm.type === 'video' ? _c('div', [_c('div', {
    ref: "dropAreaVideo",
    staticClass: "drop-area",
    on: {
      "click": function click($event) {
        return _vm.openUploadFileDialog('video');
      }
    }
  }, [_c('input', {
    ref: "dropAreaVideoInput",
    attrs: {
      "type": "file"
    },
    on: {
      "change": function change($event) {
        return _vm.handleUploadFile('video');
      }
    }
  }), _vm._v(" "), _vm.storedVideo ? _c('div', {
    staticClass: "image-preview"
  }, [_c('div', {
    staticClass: "img-container"
  }, [!_vm.videoUploaded ? _c('div', {
    staticClass: "img-container video"
  }) : _vm._e(), _vm._v(" "), _vm.videoUploaded ? _c('div', {
    staticClass: "img-container"
  }, [_vm.videoUploaded ? _c('video', {
    attrs: {
      "src": _vm.storedVideo
    }
  }) : _vm._e()]) : _vm._e()]), _vm._v(" "), _vm.showImageName('image') ? _c('div', {
    staticClass: "img-name"
  }, [_vm._v("{{}}")]) : _vm._e()]) : _vm._e()])]) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "uploader-action-text"
  }, [_vm._v(_vm._s(_vm.computedActionText))])]);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = function __vue_inject_styles__(inject) {
  if (!inject) return;
  inject("data-v-ad07be16_0", {
    source: ".stg-uploader{width:100%;border-radius:10px;background:rgba(0,0,0,.2);padding:15px;display:flex;flex-direction:column;box-sizing:border-box}.stg-uploader .drop-area{width:100%;min-height:150px}.stg-uploader .drop-area input{visibility:hidden;display:none}.stg-uploader .drop-area .image-preview{display:flex;flex-direction:column;width:150px;height:150px;overflow:hidden;border-radius:15px;margin-right:30px;position:relative}.stg-uploader .drop-area .image-preview:last-of-type{margin-right:0}.stg-uploader .drop-area .image-preview .img-container{width:100%;height:100%}.stg-uploader .drop-area .image-preview .img-name{position:absolute;max-width:80%;left:10%;bottom:10px;background:#000;color:#fff;white-space:nowrap;overflow:hidden;padding:3px 10px 3px 10px;box-sizing:border-box;text-overflow:ellipsis;border-radius:10px;text-align:center}.stg-uploader .drop-area .image-preview .img-container img{width:100%;height:100%;object-fit:cover;object-position:center center}.stg-uploader .drop-area .image-preview .img-container.video{background:url(assets/images/video-player.svg) no-repeat center center;background-size:contain}.stg-uploader .uploader-action-text{text-align:center;color:#000}.stg-uploader .uploaded-files{width:100%;height:100%;display:flex}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = undefined;
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, createInjector, undefined, undefined);

var index = {
  install: function install(Vue, options) {
    Vue.component("stg-uploader", __vue_component__);
  }
};

module.exports = index;
