const generateTicketId = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TKT-${stamp}-${rand}`;
};

module.exports = generateTicketId;

