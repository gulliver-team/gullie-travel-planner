"use client";

import DecryptedText from './DecryptedText';

export function DecryptedTextDemo() {
  return (
    <div className="space-y-8 p-8 bg-black text-white">
      <h2 className="text-2xl font-bold mb-8">DecryptedText Component Examples</h2>
      
      {/* Example 1: Default hover effect */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Example 1: Default (hover to decrypt)</p>
        <DecryptedText 
          text="Hover over me to reveal the text!" 
          className="text-green-400 text-xl"
          encryptedClassName="text-gray-600 text-xl"
        />
      </div>

      {/* Example 2: Custom speed and characters */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Example 2: Custom speed and characters</p>
        <DecryptedText
          text="GULLIE TRAVEL PLANNER"
          speed={100}
          maxIterations={20}
          characters="GULLIE0123456789!@#"
          className="text-purple-400 text-2xl font-bold"
          encryptedClassName="text-purple-900 text-2xl font-bold"
        />
      </div>

      {/* Example 3: Animate on view (center reveal) */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Example 3: Animate on view (center reveal)</p>
        <DecryptedText
          text="This text animates when scrolled into view"
          animateOn="view"
          revealDirection="center"
          sequential={true}
          speed={40}
          className="text-blue-400 text-lg"
          encryptedClassName="text-blue-900 text-lg"
        />
      </div>

      {/* Example 4: Sequential reveal from end */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Example 4: Sequential reveal from end</p>
        <DecryptedText
          text="Watch me reveal from the end"
          sequential={true}
          revealDirection="end"
          speed={60}
          className="text-yellow-400 text-lg"
          encryptedClassName="text-yellow-900 text-lg"
        />
      </div>

      {/* Example 5: Using original characters only */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Example 5: Using original characters only</p>
        <DecryptedText
          text="123-456-7890"
          useOriginalCharsOnly={true}
          speed={80}
          className="text-red-400 text-xl font-mono"
          encryptedClassName="text-red-900 text-xl font-mono"
        />
      </div>

      {/* Example 6: Large heading with gradient */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Example 6: Large heading with gradient</p>
        <h1>
          <DecryptedText
            text="WELCOME TO GULLIE"
            animateOn="view"
            sequential={true}
            revealDirection="start"
            speed={50}
            className="gradient-text text-6xl font-bold"
            encryptedClassName="text-gray-800 text-6xl font-bold"
          />
        </h1>
      </div>

      {/* Example 7: Fast scramble effect */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Example 7: Fast scramble effect</p>
        <DecryptedText
          text="⚡ Lightning Fast Migration ⚡"
          speed={20}
          maxIterations={30}
          characters="⚡✨🚀💫⭐🌟"
          className="text-cyan-400 text-2xl"
          encryptedClassName="text-cyan-900 text-2xl"
        />
      </div>

      {/* Example 8: Multi-line text */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Example 8: Multi-line text</p>
        <DecryptedText
          text={`Navigate global relocation with confidence.
Get personalized visa guidance.
Comprehensive support for your journey.`}
          animateOn="view"
          sequential={true}
          speed={30}
          className="text-gray-300"
          encryptedClassName="text-gray-700"
          parentClassName="block max-w-md"
        />
      </div>
    </div>
  );
}