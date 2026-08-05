type ButtonProps = {
    text: string;
    onClick?: () => void;
    variant?: "primary" | "secondary";
};

function Button({
    text,
    onClick,
    variant = "primary",
}: ButtonProps) {
    const baseStyle =
    "rounded-xl px-8 py-3 font-semibold transition duration-300";

const variants = {
    primary:
        "bg-violet-600 text-white hover:bg-violet-700",
    secondary:
        "border border-violet-500 text-white hover:bg-violet-500/10",
};

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]}`}
        >
        {text}
        </button>
    );
}

export default Button; 