import { createContext, ReactNode, useEffect, useState } from "react"

enum Layout {
    MainOpen = "main",
    LeftSidebarOpen = "left",
    RightSidebarOpen = "right"
}

type LayoutContextType = {
    currentLayout: Layout,
    setCurrentLayout: (l: Layout) => void
}

const isLeftSidebarOpen = (l: Layout) => l == Layout.LeftSidebarOpen
const isRightSidebarOpen = (l: Layout) => l == Layout.RightSidebarOpen

export const LayoutContext = createContext<LayoutContextType | null>(null);

interface MainLayoutProps {
    header: ReactNode,
    main: ReactNode
}

export const MainLayout = ({ header, main }: MainLayoutProps) => {
    const [currentLayout, setCurrentLayout] = useState(Layout.MainOpen);
    const [testData, setTestData] = useState<string[]>([]);

    useEffect(() => {
        const data = [
        ];

        for (let i = 0; i < 128; i++) {
            data.push("AAAAAAAAAAAAA");
        }
        setTestData(data);
    }, [])

    return (
        <LayoutContext.Provider value={{
            currentLayout, setCurrentLayout
        }}>
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
                <div style={{
                    display: "flex",
                    height: "100%"
                }}>
                    <div style={{
                        display: "flex",
                        width: "100%",
                        flexDirection: "column"
                    }}>

                        {main}
                        <div>
                            <button onClick={() => {
                                setCurrentLayout(Layout.LeftSidebarOpen);
                            }}>Open Left</button>

                            <button onClick={() => {
                                setCurrentLayout(Layout.RightSidebarOpen);
                            }}>Open Right</button>
                        </div>
                    </div>
                    <div style={{
                        display: isRightSidebarOpen(currentLayout) ? "block" : "none"
                    }}>right</div>
                </div>

            </div>
        </LayoutContext.Provider>
    )
}