// import autosize from 'autosize'
import { getStyle, getScrollTop, getScrollEventTarget } from "@/util/";

const autosize = el => {
  const originalHeight = el.style.height;
  el.style.height = "";
  let endHeight = el.scrollHeight;
  if (el.scrollHeight === 0) {
    el.style.height = originalHeight;
    return;
  }
  el.style.height = endHeight + "px";
};

const loadMore = {
  bind: (el, binding) => {
    let windowHeight = window.screen.height;
    let height;
    let setTop;
    let paddingBottom;
    let marginBottom;
    let requestFram;
    let oldScrollTop;
    let scrollEl;
    let heightEl;
    let scrollType = el.attributes.type && el.attributes.type.value;
    let scrollReduce = 2;
    if (scrollType === 2) {
      scrollEl = el;
      heightEl = el.children[0];
    } else {
      scrollEl = getScrollEventTarget(el);
      heightEl = el;
    }
    el.addEventListener(
      "touchstart",
      () => {
        height = heightEl.clientHeight;
        if (scrollType === 2) {
          // height = height
        }
        setTop = el.offsetTop;
        paddingBottom = getStyle(el, "paddingBottom");
        marginBottom = getStyle(el, "marginBottom");
      },
      false
    );

    el.addEventListener(
      "touchmove",
      () => {
        loadMore();
      },
      false
    );

    el.addEventListener(
      "touchend",
      () => {
        oldScrollTop = getScrollTop(scrollEl);
        moveEnd();
      },
      false
    );

    const moveEnd = () => {
      requestFram = requestAnimationFrame(() => {
        if (getScrollTop(scrollEl) !== oldScrollTop) {
          oldScrollTop = getScrollTop(scrollEl);
          moveEnd();
        } else {
          cancelAnimationFrame(requestFram);
          height = heightEl.clientHeight;
          loadMore();
        }
      });
    };

    const loadMore = () => {
      if (
        getScrollTop(scrollEl) + windowHeight >=
        height + setTop + paddingBottom + marginBottom - scrollReduce
      ) {
        binding.value();
      }
    };
  }
};

/**
 * 长按指令
 */
const press = {
  bind: function(el, binding) {
    let pressTimer = null;
    if (typeof binding.fn !== "function")
      // eslint-disable-next-line
      console.warn(
        `vue directive 'v-press' not include function with the prop 'fn'`
      );

    const handler = e => void binding.value.fn(e);
    const start = e => {
      if (e.type === "click" && e.button !== 0) return;
      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          handler();
        }, binding.value.time || 650);
      }
    };

    const cancel = e => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    el.addEventListener("mousedown", start);
    el.addEventListener("touchstart", start);

    el.addEventListener("click", cancel);
    el.addEventListener("mouseout", cancel);
    el.addEventListener("touchend", cancel);
    el.addEventListener("touchcancel", cancel);
  }
};

export default {
  txtautosize: {
    inserted(el) {
      autosize(el);
    },
    update(el) {
      autosize(el);
    }
  },

  "load-more": loadMore,

  press
};
