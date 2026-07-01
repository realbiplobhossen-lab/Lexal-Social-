import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { uploadFileWithProgress, createPost } from '../services/appService';

export default function CreatePostScreen({ userData, setScreen }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) setFileType("image");
      else if (selectedFile.type.startsWith("video/")) setFileType("video");
      else if (selectedFile.type.startsWith("audio/")) setFileType("audio");
      else setFileType("document");
    }
  };

  const handlePublish = () => {
    if (!text.trim() && !file) return alert("কিছু লিখুন বা ফাইল যুক্ত করুন!");

    if (file) {
      setIsUploading(true);
      uploadFileWithProgress(file, 
        (progressPercent) => {
          setProgress(progressPercent); // ডাইনামিক প্রোগ্রেস বার আপডেট
        },
        async (downloadUrl) => {
          await createPost(auth.currentUser.uid, userData?.username, userData, text, downloadUrl, fileType, file.name);
          finalizePost();
        },
        (error) => {
          alert("আপলোড ব্যর্থ: " + error.message);
          setIsUploading(false);
        }
      );
    } else {
      setIsUploading(true);
      createPost(auth.currentUser.uid, userData?.username, userData, text, "", "", "")
        .then(() => finalizePost());
    }
  };

  const finalizePost = () => {
    setIsUploading(false);
    setProgress(0);
    setFile(null);
    setText("");
    alert("পোস্ট সফলভাবে পাবলিশ হয়েছে!");
    setScreen('home'); // রিয়েল-টাইম ফিডে ব্যাক করা হলো
  };

  return (
    <div className="max-w-xl mx-auto my-6 p-6 bg-[#1f2937] rounded-xl shadow-lg border border-gray-700 text-white">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">✨ নতুন পোস্ট তৈরি / আপলোড</h2>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="ফেসবুকের মতো আপনার মনে কী আছে লিখুন..." 
        className="w-full h-32 p-3 bg-[#111827] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none mb-4"
      />
      
      <input type="file" accept="image/*,video/*,audio/*,.pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 mb-4 cursor-pointer" />

      {file && (
        <div className="p-3 bg-[#111827] rounded-lg mb-4 border border-gray-600">
          <p className="text-sm text-blue-400 mb-2">📎 ফাইল রেডি: {file.name}</p>
          {fileType === 'image' && <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-48 rounded object-contain" />}
          {fileType === 'video' && <video src={URL.createObjectURL(file)} controls className="max-h-48 rounded w-full" />}
        </div>
      )}

      {isUploading && (
        <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
          <div className="bg-blue-500 h-4 text-xs font-bold text-center text-white transition-all duration-300" style={{ width: `${progress}%` }}>
            {progress}% আপলোড হচ্ছে...
          </div>
        </div>
      )}

      <button onClick={handlePublish} disabled={isUploading} className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 font-bold rounded-lg transition">
        {isUploading ? "দয়া করে অপেক্ষা করুন..." : "🚀 পাবলিশ করুন"}
      </button>
    </div>
  );
          }

