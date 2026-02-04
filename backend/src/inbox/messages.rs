use uuid::Uuid;

#[derive(Debug, Clone, Copy)]
pub enum InboxMessageType<T> {
    Broadcast { from: Option<Uuid>, data: T },
    Direct { recipient: Uuid, data: T },
    /// Gets sent when the inbox should signal the current device that it should change to the overlay
    ChangeOverlay { overlay_id: u8 },

    /// Set the specified Id as the new current device id
    SetCurrentDeviceId { device_id: u8 }
}