import { ReactNode } from "react"

interface MainLayoutProps {
    header: ReactNode,
    main: ReactNode
}

export const MainLayout = ({ header, main }: MainLayoutProps) => {
    return (
        <div style={{
            display: "flex",
            height: "100%",
            width: "100%",
            flexDirection: "column"
        }}>
            <header style={{
                margin: "1em",
                display: "flex",
                justifyContent: "space-between",
            }}>
                {header}
            </header>
            {main}
        </div>
    )
}