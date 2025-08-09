const RootLayout = ({ children}: {children: React.ReactNode})=> {
    return (
        <html lang="en">
            <body className= "antialiased font-poppins"> {children}</body>
        </html>
    );
};
export default RootLayout;