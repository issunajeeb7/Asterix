'use client';

import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaPaperPlane, FaImage, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    imageUrl?: string;
}

export default function ElderlyAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hello! I\'m Asterix, your safety assistant. I\'m here to help you stay safe online. What would you like to know?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<{ uri: string; mimeType: string; preview: string; file: File } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        try {
            const response = await fetch('/api/chat/history');
            if (response.ok) {
                const data = await response.json();
                if (data.messages && data.messages.length > 0) {
                    const formattedMessages = data.messages.map((msg: any) => ({
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(msg.timestamp),
                        imageUrl: msg.imageUrl // Include image URL from history
                    }));
                    setMessages(formattedMessages);
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const saveMessage = async (role: 'user' | 'assistant', message: string, imageUrl?: string) => {
        try {
            await fetch('/api/chat/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, message, imageUrl })
            });
        } catch (error) {
            console.error('Error saving message:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Image size should be less than 10MB');
            return;
        }

        setIsUploading(true);
        try {
            const preview = URL.createObjectURL(file);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/chat/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const data = await response.json();
            setUploadedImage({
                uri: data.data,
                mimeType: data.mimeType,
                preview,
                file
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userInput = input;
        let imageUrl: string | undefined = undefined;

        setInput('');
        setIsLoading(true);

        // Upload image to Supabase storage if present
        if (uploadedImage) {
            try {
                const supabase = (await import('@/lib/supabase/client')).createClient();
                const fileName = `${Date.now()}-${uploadedImage.file.name}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('chat_images')
                    .upload(fileName, uploadedImage.file, {
                        contentType: uploadedImage.mimeType,
                        upsert: false
                    });

                if (!uploadError && uploadData) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('chat_images')
                        .getPublicUrl(fileName);
                    imageUrl = publicUrl;
                }
            } catch (error) {
                console.error('Error uploading image to storage:', error);
            }
        }

        const userMessage: Message = {
            role: 'user',
            content: userInput,
            timestamp: new Date(),
            imageUrl: imageUrl
        };

        setMessages(prev => [...prev, userMessage]);

        // Clear uploaded image preview immediately after adding to messages
        const imageToSend = uploadedImage;
        if (uploadedImage) {
            URL.revokeObjectURL(uploadedImage.preview);
            setUploadedImage(null);
        }

        // Save user message to database with image URL
        await saveMessage('user', userInput, imageUrl);

        try {
            const requestBody: any = {
                message: userInput,
                ageGroup: 'elderly'
            };

            if (imageToSend) {
                requestBody.imageUri = imageToSend.uri;
                requestBody.imageMimeType = imageToSend.mimeType;
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Save assistant message to database
            await saveMessage('assistant', data.response);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'I apologize, but I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            await saveMessage('assistant', errorMessage.content);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = [
        { icon: '📧', label: 'Check Email', action: 'How can I tell if an email is legitimate?' },
        { icon: '📞', label: 'Report Scam', action: 'I received a suspicious phone call. What should I do?' },
        { icon: '❓', label: 'Ask Question', action: 'I have a question about online safety' }
    ];

    const handleQuickAction = (action: string) => {
        setInput(action);
        inputRef.current?.focus();
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Header - Fixed at top */}
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-5 shadow-lg z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-2">
                        <Image src="/asterix_logo.svg" alt="Asterix" width={48} height={48} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Asterix</h1>
                        <p className="text-base opacity-90">Your trusted online safety guide</p>
                    </div>
                </div>
            </div>

            {/* Messages - Scrollable area with calculated height */}
            <div className="absolute top-[84px] bottom-[200px] left-0 right-0 overflow-y-auto px-5 py-5 space-y-5">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'assistant'
                            ? 'bg-white p-2'
                            : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                            }`}>
                            {message.role === 'assistant' ? (
                                <Image src="/asterix_logo.svg" alt="Asterix" width={40} height={40} />
                            ) : (
                                <span className="text-2xl">👤</span>
                            )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`rounded-2xl px-4 py-3 ${message.role === 'assistant'
                                ? 'bg-white text-gray-800 shadow-md'
                                : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                                }`}>
                                {/* Display image if present */}
                                {message.imageUrl && (
                                    <img
                                        src={message.imageUrl}
                                        alt="Attached image"
                                        className="rounded-lg mb-3 max-w-full h-auto max-h-56 object-contain"
                                    />
                                )}
                                <div
                                    className="text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: message.content }}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-2">
                            <Image src="/asterix_logo.svg" alt="Asterix" width={40} height={40} />
                        </div>
                        <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions & Input - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-green-50 to-emerald-50 pb-15">
                {/* Quick Actions */}
                <div className="px-5 pb-4">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickAction(action.action)}
                                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap hover:opacity-90 transition-opacity shadow-md"
                            >
                                <span className="text-xl">{action.icon}</span>
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="px-5 pb-5">
                    {/* Image Preview */}
                    {uploadedImage && (
                        <div className="mb-2 relative inline-block">
                            <img
                                src={uploadedImage.preview}
                                alt="Upload preview"
                                className="h-24 rounded-lg border-2 border-teal-500"
                            />
                            <button
                                onClick={() => {
                                    URL.revokeObjectURL(uploadedImage.preview);
                                    setUploadedImage(null);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                            >
                                <FaTimes className="text-sm" />
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-full shadow-lg flex items-center gap-2 px-4 py-2.5">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                        {/* Image upload button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-gray-400 hover:text-teal-600 transition-colors"
                        >
                            <FaImage className="text-2xl" />
                        </button>

                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your question here..."
                            className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`text-white p-3 rounded-full transition-all ${input.trim() && !isLoading
                                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:opacity-90'
                                : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <FaPaperPlane className="text-base" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
