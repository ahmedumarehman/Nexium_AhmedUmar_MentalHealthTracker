'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';


const moodSounds: { [emoji: string]: string } = {
    '😄': '/sounds/happy.mp3',
    '🙂': '/sounds/calm.mp3',
    '😐': '/sounds/neutral.mp3',
    '😔': '/sounds/sad.mp3',
    '😢': '/sounds/crying.mp3',
    '😡': '/sounds/angry.mp3',
    '😈': '/sounds/devilish.mp3',
    '🥰': '/sounds/loving.mp3',
    '😲': '/sounds/surprised.mp3',
    '😴': '/sounds/tired.mp3',
    '🤒': '/sounds/sick.mp3',
};

const moodVideos: { [emoji: string]: string } = {
    '😄': 'https://www.youtube.com/results?search_query=stay+happy+motivational',
    '🙂': 'https://www.youtube.com/results?search_query=relaxing+videos',
    '😐': 'https://www.youtube.com/results?search_query=neutral+mood+uplift',
    '😔': 'https://www.youtube.com/results?search_query=cheer+up+videos',
    '😢': 'https://www.youtube.com/results?search_query=feel+better+videos',
    '😡': 'https://www.youtube.com/results?search_query=stay+calm+when+angry',
    '😈': 'https://www.youtube.com/results?search_query=control+evil+thoughts',
    '🥰': 'https://www.youtube.com/results?search_query=falling+in+love+moments',
    '😲': 'https://www.youtube.com/results?search_query=surprising+stories',
    '😴': 'https://www.youtube.com/results?search_query=relax+and+sleep+sounds',
    '🤒': 'https://www.youtube.com/results?search_query=feel+better+soon+videos',
};
export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mood, setMood] = useState('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [latestEntry, setLatestEntry] = useState<{ mood: string; note: string } | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error || !data.session) {
                router.push('/');
            } else {
                setUser(data.session.user);
            }
            setLoading(false);
        };

        checkSession();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const playMoodSound = (emoji: string) => {
        const audioPath = moodSounds[emoji];
        if (audioPath) {
            new Audio(audioPath).play();
        }
    };

    const handleMoodClick = (emoji: string) => {
        setMood(emoji);
        playMoodSound(emoji);
    };

    const handleSubmit = async () => {
        if (!mood || !note) {
            toast.error('Please select a mood and write a note.');
            return;
        }

        setSaving(true);
        if (!user) {
            toast.error('User not found.');
            setSaving(false);
            return;
        }

        const { error } = await supabase.from('moods').insert([
            {
                user_id: user.id,
                mood,
                note,
                timestamp: new Date().toISOString(),
            },
        ]);


        if (error) {
            toast.error('Failed to save entry.');
        } else {
            toast.success('Mood saved successfully!');
            setLatestEntry({ mood, note });
            setMood('');
            setNote('');
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500 text-lg">Checking session...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 px-4 py-6 flex flex-col lg:flex-row items-start gap-6">

            {/* Left Side - Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full">
                <h1 className="text-3xl font-bold text-center text-purple-700 mb-4">Daily Mood Tracker</h1>
                <p className="text-center text-gray-500 mb-6">
                    Logged in as <span className="font-semibold">{user.email}</span>
                </p>

                <div className="grid grid-cols-5 gap-2 text-2xl">
                    {Object.keys(moodSounds).map((emoji, i) => (
                        <button
                            key={i}
                            className={`p-3 rounded-xl border-2 ${mood === emoji ? 'border-purple-600 bg-purple-100' : 'border-transparent'
                                }`}
                            onClick={() => handleMoodClick(emoji)}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>


                <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-700 mb-2">Your Note</label>
                    <textarea
                        rows={4}
                        className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        placeholder="Write something about your day..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Mood'}
                </button>

                {/* Suggestion Button */}
                {latestEntry && moodVideos[latestEntry.mood] && (
                    <a
                        href={moodVideos[latestEntry.mood]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 block text-center bg-yellow-400 text-black py-2 rounded-xl font-semibold hover:bg-yellow-500 transition"
                    >
                        Watch videos to match your mood 🎥
                    </a>
                )}
            </div>

            {/* Right Side - Latest Entry */}
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                <h2 className="text-xl font-bold text-purple-700 mb-4">Latest Mood Entry</h2>
                {latestEntry ? (
                    <div>
                        <p className="text-3xl mb-2">{latestEntry.mood}</p>
                        <p className="text-gray-700">{latestEntry.note}</p>
                    </div>
                ) : (
                    <p className="text-gray-500">No entry yet.</p>
                )}
                <button onClick={handleLogout} className="mt-6 text-red-500 hover:underline">
                    Log out
                </button>
            </div>
        </div>
    );
}
