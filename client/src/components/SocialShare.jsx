import toast from 'react-hot-toast';

export default function SocialShare({ url, title }) {
    const handleShare = async (platform) => {
        const shareUrl = encodeURIComponent(url);
        const shareTitle = encodeURIComponent(title || "Check out this cool AI generation from AI Hub!");

        const platforms = {
            whatsapp: `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`,
            twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
            copy: url
        };

        if (platform === 'copy') {
            try {
                // For base64 or blob URLs that are long, we might just want to say "Copied!" if it's a blob.
                // But usually, these are hosted URLs.
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard! 📋");
            } catch (err) {
                toast.error("Failed to copy link.");
            }
            return;
        }

        if (navigator.share && platform === 'native') {
            try {
                await navigator.share({
                    title: 'AI Hub Generation',
                    text: title,
                    url: url,
                });
                return;
            } catch (err) {
                // Native share not supported, fallback to platform-specific share
            }
        }

        window.open(platforms[platform], '_blank');
    };

    return (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
                onClick={() => handleShare('whatsapp')}
                style={{ background: '#25D366', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                title="Share on WhatsApp"
            >
                WhatsApp
            </button>
            <button
                onClick={() => handleShare('twitter')}
                style={{ background: '#000000', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                title="Share on X"
            >
                X (Twitter)
            </button>
            <button
                onClick={() => handleShare('copy')}
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                title="Copy Image URL"
            >
                Copy Link
            </button>
        </div>
    );
}
