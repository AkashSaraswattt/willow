const UserAvatar = ({ name, size = 40, className = "" }) => {
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getColor = (name) => {
    if (!name) return "#6B7280";
    const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const initials = getInitials(name);
  const bgColor = getColor(name);
  const fontSize = size * 0.4;

  return (
    <svg 
      width={size} 
      height={size} 
      className={`rounded-full ${className}`}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle cx={size/2} cy={size/2} r={size/2} fill={bgColor} />
      <text 
        x="50%" 
        y="50%" 
        textAnchor="middle" 
        dy="0.35em" 
        fontSize={fontSize}
        fill="white" 
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
};

export default UserAvatar;