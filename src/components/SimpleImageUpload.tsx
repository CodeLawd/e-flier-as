"use client";

import { useState, useRef, ChangeEvent } from "react";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";
import Image from "next/image";

// You can adjust these settings to match your specific template design
const TEMPLATE_CONFIG = {
  // The path to your template image in the public folder
  templateImagePath: "/layout.png",

  // Position and size of the user's image on the template
  userImagePosition: {
    top: "32%", // vertical position from the top (as percentage)
    left: "50%", // horizontal position from the left (as percentage)
    width: "36%", // width of the user image (as percentage)
    height: "27%", // height of the user image (as percentage)
    shape: "square", // 'circle', 'square', or 'rectangle'
    borderColor: "white", // color of the border around the user image
    borderWidth: 2, // width of the border in pixels
  },
};

const SimpleImageUpload = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const inviteRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUserImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const downloadInvite = async () => {
    if (!inviteRef.current) return;

    try {
      setIsDownloading(true);
      const dataUrl = await htmlToImage.toJpeg(inviteRef.current, {
        quality: 0.95,
      });
      saveAs(dataUrl, "e-invite.jpeg");
    } catch (error) {
      console.error("Error generating invite:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine the CSS class for the shape
  const getShapeClass = () => {
    const { shape } = TEMPLATE_CONFIG.userImagePosition;
    switch (shape) {
      case "circle":
        return "rounded-full";
      case "square":
        return "rounded-lg";
      case "rectangle":
        return "rounded-md";
      default:
        return "rounded-full";
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 !text-black">
      {/* <h1 className="text-3xl font-bold mb-6 text-black">
        Apostolic Summit 2025
      </h1> */}

      <div className="flex w-full flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Upload Your Image
          </h2>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500 ">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 ">
                PNG, JPG or JPEG (MAX. 5MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>

          <button
            onClick={downloadInvite}
            disabled={!userImage || isDownloading}
            className="w-full mt-6 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isDownloading ? "Generating..." : "Download Your Invite"}
          </button>
        </div>

        <div className="w-full md:w-2/3 text-black">
          {/* <h2 className="text-xl font-semibold mb-4 text-black">Preview</h2> */}
          <div
            ref={inviteRef}
            className="relative w-full border-2 border-white aspect-[3/4] rounded-lg shadow-lg overflow-hidden"
          >
            {/* Template Background - Using the default template image */}
            <Image
              src={TEMPLATE_CONFIG.templateImagePath}
              alt="Template"
              className="absolute inset-0 w-full h-full object-cover"
              width={1000}
              height={1000}
            />

            {/* User Image */}
            <div
              className={`absolute overflow-hidden ${getShapeClass()} shadow-lg`}
              style={{
                top: TEMPLATE_CONFIG.userImagePosition.top,
                left: TEMPLATE_CONFIG.userImagePosition.left,
                width: TEMPLATE_CONFIG.userImagePosition.width,
                height: TEMPLATE_CONFIG.userImagePosition.height,
                borderWidth: TEMPLATE_CONFIG.userImagePosition.borderWidth,
                borderColor: TEMPLATE_CONFIG.userImagePosition.borderColor,
                borderStyle: "solid",
                transform: "translate(-50%, -50%)",
              }}
            >
              {userImage ? (
                <Image
                  src={userImage}
                  alt="User"
                  className="w-full h-full object-cover"
                  width={1000}
                  height={1000}
                />
              ) : (
                <div className="w-full h-full bg-white/30 flex items-center justify-center">
                  <p className="text-white text-center px-4 font-medium">
                    Upload your photo
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 text-black mt-2 text-center">
            Upload your photo and click download to get your custom invitation
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleImageUpload;
