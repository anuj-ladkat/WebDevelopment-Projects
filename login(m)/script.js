document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const loginBtn = this.querySelector('.login-btn');
  loginBtn.classList.add('loading');
  
  const tl = gsap.timeline();
  
  // Get the house image element
  const originalHouseImage = document.querySelector('.house-image img');
  
  // Create a new image element for expansion
  const expandingImage = originalHouseImage.cloneNode(true);
  expandingImage.classList.add('expanding-image');
  document.body.appendChild(expandingImage);

  document.addEventListener('DOMContentLoaded', function() {
    const enrollBtn = document.getElementById('enroll-btn');
    const tooltip = enrollBtn.nextElementSibling;

    enrollBtn.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';
    });

    enrollBtn.addEventListener('mouseleave', (e) => {
        if (!tooltip.contains(e.relatedTarget)) {
            tooltip.style.display = 'none';
        }
    });

    tooltip.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
});

  
  // Shrink and fade out the main content
  tl.to('.container', {
    scale: 0.8,
    opacity: 0,
    duration: 1.5,
    ease: "power2.in"
  });

  // Show the loading overlay
  tl.to('.loading-overlay', {
    opacity: 1,
    duration: 0.3
  });
  
  // Animate the triangle
  tl.from('.loading-triangle', {
    scale: 0,
    rotation: 360,
    duration: 2,
    ease: "elastic.out(1, 0.3)"
  });
  
  // Hide the triangle
  tl.to('.loading-triangle', {
    opacity: 0,
    duration: 0.3
  });
  
  // Hide the loading overlay
  tl.to('.loading-overlay', {
    opacity: 0,
    duration: 0.3
  });
  
  // Set initial state for the expanding image
  tl.set(expandingImage, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    xPercent: -50,
    yPercent: -50,
    width: '10px',
    height: '10px',
    opacity: 1,
    zIndex: 1002
  });
  
  // Expand the image to full screen
  tl.to(expandingImage, {
    width: '100vw',
    height: '100vh',
    duration: 2,
    ease: "power2.out"
  });

  // Keep the expanded image visible for a moment
  tl.to({}, {duration: 1});
  
  // Fade out the expanding image
  tl.to(expandingImage, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      expandingImage.remove(); // Remove the expanding image from the DOM
    }
  });
  
  // Bring back the main content (login window)
  tl.to('.container', {
    scale: 1,
    opacity: 1,
    duration: 0.5,
    ease: "power2.out",
    onComplete: () => {
      resetLoginForm();
      loginBtn.classList.remove('loading');
    }
  });
});

function resetLoginForm() {
  document.getElementById('loginForm').reset();
  document.querySelector('#loginForm button[type="submit"]').disabled = false;
  document.querySelector('#loginForm input').focus();
}