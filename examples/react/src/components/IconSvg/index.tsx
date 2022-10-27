import './index.css'

const IconSvg: React.FC<{ name: string; size?: string | number }> = (props) => {
  const size = `${props.size ?? ''}`
  const fontSize = `${size}`.endsWith("px") ? size : `${size}px`

  return (
    <svg
      className="icon"
      aria-hidden="true"
      style={{ width: fontSize, height: fontSize }}
    >
      <use xlinkHref={`#${props.name}`} />
    </svg>
  );
};

export default IconSvg;
