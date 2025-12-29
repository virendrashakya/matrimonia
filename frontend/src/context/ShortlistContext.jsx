import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ShortlistContext = createContext();

export function ShortlistProvider({ children }) {
    const [shortlist, setShortlist] = useState(() => {
        const saved = localStorage.getItem('shortlist');
        return saved ? JSON.parse(saved) : [];
    });

    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('shortlistNotes');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('shortlist', JSON.stringify(shortlist));
    }, [shortlist]);

    useEffect(() => {
        localStorage.setItem('shortlistNotes', JSON.stringify(notes));
    }, [notes]);

    const addToShortlist = (profile) => {
        if (!shortlist.find(p => p._id === profile._id)) {
            setShortlist([...shortlist, profile]);
            toast.success('Added to shortlist / शॉर्टलिस्ट में जोड़ा गया');
        }
    };

    const removeFromShortlist = (profileId) => {
        setShortlist(shortlist.filter(p => p._id !== profileId));
        const newNotes = { ...notes };
        delete newNotes[profileId];
        setNotes(newNotes);
        toast.success('Removed from shortlist');
    };

    const isShortlisted = (profileId) => {
        return shortlist.some(p => p._id === profileId);
    };

    const addNote = (profileId, note) => {
        setNotes({ ...notes, [profileId]: note });
    };

    const getNote = (profileId) => {
        return notes[profileId] || '';
    };

    const clearShortlist = () => {
        setShortlist([]);
        setNotes({});
    };

    const value = {
        shortlist,
        notes,
        addToShortlist,
        removeFromShortlist,
        isShortlisted,
        addNote,
        getNote,
        clearShortlist,
        count: shortlist.length
    };

    return (
        <ShortlistContext.Provider value={value}>
            {children}
        </ShortlistContext.Provider>
    );
}

export function useShortlist() {
    const context = useContext(ShortlistContext);
    if (!context) {
        throw new Error('useShortlist must be used within ShortlistProvider');
    }
    return context;
}

export default ShortlistContext;
