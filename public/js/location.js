var position;

function getCoordinates() {
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 50000,
            maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError)
    }
}
const handleSuccess = (position) => {
    position = position;
    console.log(position)
}
const handleError = (err) => {
    console.log(err.PERMISSION_DENIED)
    if (err.PERMISSION_DENIED) {
        console.log("Permission was denied");
        console.log(err.message);
        return;
    }
    console.log(err.message);
}

getCoordinates()