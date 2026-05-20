import { createContext, FC, useContext, useState } from "react";
import { ConnectView } from "./connectView";
import { OverlayView } from "./overlay";

enum MainViewContent {
    Connect = "connect",
    Overlays = "overlays",
}

const MainViewContext = createContext(null);
export function MainViewProvider({ children }) {
    const [selectedMainView, setMainContent] = useState<MainViewContent>(MainViewContent.Connect);

    return (
        <MainViewContext.Provider value={{
            selectedMainView,
            setMainContent
        }}>
            {children}
        </MainViewContext.Provider>
    )
}

export function useMainViewProvider() {
    const ctx = useContext(MainViewContext);

    if (!ctx) {
        throw new Error("useMainViewProvider must be used inside MainViewProvider");
    }

    return ctx;
}

export const MainView: FC = () => {
    const { selectedMainView, setMainContent } = useMainViewProvider();
    const getMainContent = (content: MainViewContent) => {
        switch (content) {
            case MainViewContent.Connect:
                return (<ConnectView connect={() => {
                    setMainContent(MainViewContent.Overlays)

                }} openSynth={() => {
                }} />)
            case MainViewContent.Overlays:
                return (<OverlayView />)
        }
    }

    return (
        <main>
            {getMainContent(selectedMainView)}
        </main>
    )
}