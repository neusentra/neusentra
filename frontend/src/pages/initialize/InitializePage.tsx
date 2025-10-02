interface InitializePageProps {
    // Add any props you need for the initialization page
    isLoading: boolean;
}

export const InitializePage: React.FC<InitializePageProps> = ({ isLoading }) => {
    return (
        <div>{isLoading ? "Initializing..." : "Initialized"}</div>
    )
};
