const volumebarOutline = useRef();
const volumeslider = useRef();

const outlineRect = volumebarOutline.current.getBoundingClientRect();
const outlineWidth = Math.round(outlineRect.width);
const widthRange = e.clientX - volumebarOutline.current.offsetLeft;
