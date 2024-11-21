document.getElementById('SelfieBtn').addEventListener('click', function() {
    const faceOverlay = document.getElementById('faceOverlay');

    // Change color to green
    faceOverlay.style.fill = '#4E9459';

    // Revert back to the original color after 2-3 seconds
    setTimeout(() => {
        faceOverlay.style.fill = 'white';
    }, 2500); // Adjust time here (2500ms = 2.5 seconds)
});

function showRightSide() {
    if (window.innerWidth <= 768) {
        document.querySelector('.left-side').style.display = 'none';
        document.querySelector('.right-side').style.display = 'flex';
    }
}

document.querySelector('.take-selfie-btn').addEventListener('click', function() {
    const checkMark = document.querySelector('.check-mark');
    const desktopEllipse = document.querySelector('.desktop-ellipse');
    // const mobileEllipse = document.querySelector('.mobile-ellipse');
    const tick = document.querySelector('.tick');

    // Grow checkbox
    checkMark.style.animation = 'growCheckbox 0.5s forwards';
    checkMark.style.opacity = '1';

    // Draw circle
    setTimeout(() => {
        desktopEllipse.style.animation = 'drawCircle 1.5s forwards';
    }, 500);

    // Draw tick
    setTimeout(() => {
        tick.style.animation = 'drawTick 0.5s forwards';
    }, 2000);
});

function showLeftSide() {
    if (window.innerWidth <= 768) {
        document.querySelector('.right-side').style.display = 'none';
        document.querySelector('.left-side').style.display = 'flex';
    }
}

// Add event listener for window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        // Reset to desktop view
        document.querySelector('.left-side').style.display = 'flex';
        document.querySelector('.right-side').style.display = 'flex';
    } else {
        // Ensure correct mobile view
        showLeftSide();
    }
});

// // Initial setup
// if (window.innerWidth <= 768) {
//     document.querySelector('.desktop-ellipse').style.display = 'none';
//     document.querySelector('.mobile-ellipse').style.display = 'block';
// } else {
//     document.querySelector('.desktop-ellipse').style.display = 'block';
//     document.querySelector('.mobile-ellipse').style.display = 'none';
// }