var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
var type = connection.effectiveType;

function updateConnectionStatus() {
  if (!connection) {
      throw new Error("Navigator.connection not supported");
  }
  console.log("Connection type is change from " + type + " to " + connection.effectiveType);
}
