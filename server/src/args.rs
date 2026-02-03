use clap::Parser;


#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
pub(crate) struct Args {
    /// If you are on Windows:
    ///     The name of the device the application tries to open
    /// If you are anywhere else where supported:
    ///     The name of the virtual midi port
    #[arg(short, long)]
    pub(crate) name: Option<String>,

    #[arg(long)]
    pub(crate) list: Option<bool>,
    
    #[arg(short = 'p')]
    pub(crate) address: Option<String>,

    #[arg(short = 'v')]
    pub(crate) use_virtual: Option<bool>,
    
    #[arg(short, long, default_value = "overlays")]
    pub(crate) overlay_path: String
}
