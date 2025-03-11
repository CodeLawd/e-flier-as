# E-Invite Customizer

A simple web application that allows users to upload their photos to be placed on a pre-designed invitation template and download the result.

## Features

- **Simple Interface**: Just upload your photo and download your customized invite
- **Fixed Template Design**: Uses a professionally designed invitation template with a designated area for user photos
- **One-Click Download**: Export your customized invitation as a JPEG image

## How It Works

This application uses a fixed invitation template design with a designated area for a user's photo:

1. The user uploads their photo
2. The application places the photo in the designated area on the template
3. The user downloads the finished invitation

## Technologies Used

- Next.js (React)
- TypeScript
- Tailwind CSS
- html-to-image (for image generation)
- file-saver (for downloading images)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd e-invite
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Add your invitation template image to the `public/images` directory and name it `invitation-template.jpg`

4. Update the template configuration in `src/components/SimpleImageUpload.tsx` if needed to adjust where the user's photo will be placed on the template

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Template Configuration

To adjust where the user's photo appears on your invitation template, modify the `TEMPLATE_CONFIG` object in `src/components/SimpleImageUpload.tsx`:

```javascript
const TEMPLATE_CONFIG = {
  // The path to your template image in the public folder
  templateImagePath: "/images/invitation-template.jpg",

  // Position and size of the user's image on the template
  userImagePosition: {
    top: "40%", // vertical position from the top
    left: "50%", // horizontal position from the left
    width: "40%", // width of the user image
    height: "40%", // height of the user image
    shape: "circle", // 'circle', 'square', or 'rectangle'
    borderColor: "white", // color of the border around the user image
    borderWidth: 4, // width of the border in pixels
  },
};
```

## How to Use

1. **Upload Image**: Click on the upload area to select an image from your device
2. **Preview**: View how your invitation looks in real-time with your photo placed on the template
3. **Download**: Click the "Download Your Invite" button to save your customized invitation

## Deployment

This application can be easily deployed on Vercel:

```bash
npm install -g vercel
vercel
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the creators of html-to-image and file-saver libraries
- Inspired by the need for simple, customizable digital invitations
