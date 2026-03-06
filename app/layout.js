import './globals.css'

export const metadata = {
  title: "Vihari Co-Living | PG in Hyderabad",
  description: "Vihari Co-Living provides comfortable PG and hostel rooms in Hyderabad with food, WiFi and modern facilities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}