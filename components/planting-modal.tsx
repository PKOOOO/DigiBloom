'use client';

import { useState, useEffect, useRef } from 'react';
import { Flower, FlowerType } from '@/types/flower';
import { FlowerSelector } from './flower-selector';
import {
    Dialog,
    DialogContent
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Sprout } from 'lucide-react';

interface PlantingModalProps {
    isOpen: boolean;
    onClose: () => void;
    clickPosition: { x: number; y: number } | null;
    onPlantSuccess: (flower: Flower) => void;
}

export function PlantingModal({
    isOpen,
    onClose,
    clickPosition,
    onPlantSuccess,
}: PlantingModalProps) {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [author, setAuthor] = useState('');
    const [selectedFlower, setSelectedFlower] = useState<FlowerType>('yellow-sunflower');
    const [isLoading, setIsLoading] = useState(false);

    // Auto-focus refs
    const titleInputRef = useRef<HTMLInputElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);
    const authorInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setTitle('');
            setMessage('');
            setAuthor('');
            setSelectedFlower('yellow-sunflower');
        }
    }, [isOpen]);

    // Handle auto-focus on step change
    useEffect(() => {
        if (!isOpen) return;

        // Small timeout to allow animation/rendering to complete
        const timeoutId = setTimeout(() => {
            if (step === 2) titleInputRef.current?.focus();
            if (step === 3) messageInputRef.current?.focus();
            if (step === 4) authorInputRef.current?.focus();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [step, isOpen]);

    const handleNextStep = () => {
        if (step === 2 && !title.trim()) {
            toast.error('Please enter a title');
            titleInputRef.current?.focus();
            return;
        }
        if (step === 3 && !message.trim()) {
            toast.error('Please enter a message');
            messageInputRef.current?.focus();
            return;
        }
        setStep((prev) => prev + 1);
    };

    const handlePrevStep = () => {
        setStep((prev) => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clickPosition) {
            toast.error('Invalid planting position');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/flowers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    message: message.trim(),
                    author: author.trim() || null,
                    x: clickPosition.x,
                    y: clickPosition.y,
                    flower: selectedFlower,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to plant flower');
            }

            const newFlower = await response.json();

            toast.success('Flower planted!', {
                description: 'Your message has been added to the garden.',
            });

            onPlantSuccess(newFlower);
            onClose();
        } catch (error) {
            console.error('Error planting flower:', error);
            toast.error('Failed to plant flower', {
                description: 'Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-green-900 mb-2">Pick a flower type</h3>
                            <p className="text-sm text-green-800/60 mb-6">Each flower carries a different meaning.</p>
                            <FlowerSelector
                                selectedFlower={selectedFlower}
                                onFlowerChange={setSelectedFlower}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-md font-medium text-green-900 mb-2">
                                Give your message a title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="title"
                                ref={titleInputRef}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Hope for Tomorrow"
                                required
                                maxLength={100}
                                className="bg-white border-yellow-200 focus-visible:ring-green-500 text-lg h-12"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleNextStep();
                                    }
                                }}
                            />
                            <p className="text-xs text-green-800/50 mt-2 text-right">{title.length}/100</p>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="message" className="block text-md font-medium text-green-900 mb-2">
                                What&apos;s on your mind? <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                id="message"
                                ref={messageInputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Share your positive thoughts..."
                                required
                                rows={6}
                                maxLength={500}
                                className="bg-white border-yellow-200 resize-none focus-visible:ring-green-500 text-base"
                            />
                            <p className="text-xs text-green-800/50 mt-2 text-right">{message.length}/500</p>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <form id="plant-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="author" className="block text-md font-medium text-green-900 mb-2">
                                Sign your name (optional)
                            </label>
                            <Input
                                id="author"
                                ref={authorInputRef}
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="Anonymous"
                                maxLength={50}
                                className="bg-white border-yellow-200 focus-visible:ring-green-500 text-lg h-12"
                            />
                        </div>


                    </form>
                );
            default:
                return null;
        }
    };



    const isNextDisabled = () => {
        if (step === 2 && !title.trim()) return true;
        if (step === 3 && !message.trim()) return true;
        return false;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-yellow-50 p-0 overflow-hidden gap-0 flex flex-col max-h-[100dvh] top-[10%] sm:top-[15%] translate-y-0">


                <div className="p-6 overflow-y-auto flex-grow">
                    {renderStepContent()}
                </div>

                <div className="p-4 bg-yellow-100/30 border-t border-yellow-200 shrink-0">
                    <div className="flex gap-3">
                        {step > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevStep}
                                className="border-yellow-300 text-green-800 hover:bg-yellow-100 hover:text-green-900 font-medium h-12 w-24 shrink-0 rounded-xl"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>
                        )}

                        {step < 4 ? (
                            <Button
                                onClick={handleNextStep}
                                disabled={isNextDisabled()}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold h-12 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                Next Step
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit} // Using explicit handler instead of form submit
                                disabled={isLoading}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold h-12 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoading ? 'Planting...' : 'Plant Flower'}
                                {!isLoading && <Sprout className="w-4 h-4 ml-2" />}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
