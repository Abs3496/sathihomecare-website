import heroVideo from "./videos/hero.mp4";
import heroBanner from "./images/homepage/herobanner.jpg";
import careJourney from "./images/homepage/carejourney.png";
import nursingIcon from "./images/homepage/servicenursing.jpg";
import therapyIcon from "./images/homepage/servicetherapy.jpg";
import consultationIcon from "./images/homepage/servicecouncilling.jpg";
import nursingServiceImage from "./images/services/nursing.jpeg";
import therapyServiceImage from "./images/services/therapy.jpeg";
import counselingServiceImage from "./images/services/councilling.jpeg";
import dharmendraPlaceholder from "./images/founders/Dharmendra.jpg";
import pinkuPlaceholder from "./images/founders/pinku.jpg";
import logo from "./images/icons/logo.png";

export const homepageAssets = {
  heroVideo,
  heroBanner,
  careJourney,
  logo,
  serviceIcons: {
    nursing: nursingIcon,
    therapy: therapyIcon,
    consultation: consultationIcon
  }
};

export const serviceAssets = {
  nursing: nursingServiceImage,
  therapy: therapyServiceImage,
  counselling: counselingServiceImage
};

export const founderAssets = {
  dharmendra: dharmendraPlaceholder,
  pinku: pinkuPlaceholder
};

export const iconAssets = {
  careHeart: logo
};
