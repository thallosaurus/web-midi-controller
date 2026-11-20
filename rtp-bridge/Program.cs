using System.Net;
using Commons.Music.Midi;
using Haukcode.RtpMidi;

namespace RtpBridge;

internal static class Program
{
    private static RtpMidiSession? session;
    //private static InputDevice? device;

    public static async Task Main(string[] args)
    {
        var access = MidiAccessManager.Default;

        ListDevices(access);

        Console.WriteLine("RTP Bridge starting...");
        await using var s = new RtpMidiSession("My Session CSharp");
        session = s;

        /*var device = InputDevice.GetByName("Launchpad Pro MK3 LPProMK3 MIDI");
        device.EventReceived += OnMidiEventReceived;
        device.StartEventsListening();*/
        var inport = access.Inputs.FirstOrDefault(i => i.Name == "Launchpad Pro MK3 LPProMK3 MIDI") ?? access.Inputs.Last();
        var input = access.OpenInputAsync(inport.Id).Result;
        input.MessageReceived += async (obj, e) =>
        {
            Console.WriteLine($"{e.Timestamp} {e.Start} {e.Length} {e.Data[0].ToString("X")}");
            if (session is not null)
            {
                //Console.WriteLine("sending bytes to session");
                var data = e.Data.Take(e.Length).ToArray();
                try
                {

                    await session.SendMidiAsync(data);
                    Console.WriteLine($"SEND {data.Length}: {BitConverter.ToString(data)}");
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error: {ex}");

                }
            }
        };

        session.EnableRecoveryJournal = false;

        session.MidiReceived.Subscribe(midiBytes =>
        {
            Console.WriteLine($"MIDI: {BitConverter.ToString(midiBytes.ToArray())}");
        });
        session.StateChanges.Subscribe(state => Console.WriteLine($"State: {state}"));

        Console.CancelKeyPress += async delegate
        {
            // call methods to clean up
            await session.DisconnectAsync();
            await input.CloseAsync();
            //device.Dispose();
        };

        try
        {
            await session.ConnectAsync(new IPEndPoint(IPAddress.Parse("127.0.0.1"), 5040));
            Console.WriteLine("Running.");
            await Task.Delay(Timeout.Infinite);
        }
        catch (OperationCanceledException ex)
        {
            // graceful
            Console.Error.WriteLine($"Error: {ex}");
            await session.DisconnectAsync();
            await input.CloseAsync();
            //device.Dispose();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Fatal error: {ex}");
            Environment.ExitCode = 1;
        }
        finally
        {
            Console.WriteLine("RTP Bridge stopped");
        }
    }

    private static void ListDevices(IMidiAccess access)
    {
        Console.WriteLine("Input Devices:");
        foreach (var d in access.Inputs)
        {
            Console.WriteLine($"- {d.Name}");
        }

        Console.WriteLine("Output Devices:");
        foreach (var d in access.Outputs)
        {
            Console.WriteLine($"- {d.Name}");
        }
    }

    private static async void OnMidiEventReceived(object? sender, MidiEventAction e)
    {
        //var midiDevice = (MidiDevice?)sender;
        /*var midiDevice = (MidiDe)
        if (midiDevice is null)
        {
            Console.Error.WriteLine("midiDriver is null");
            return;
        }

        Console.WriteLine($"Event received from '{midiDevice.Name}: {e.Event}");

        using (var converter = new MidiEventToBytesConverter())
        {
            // 3. Convert the event to a byte array
            byte[] bytes = converter.Convert(e.Event);

            // Output the resulting bytes (e.g., [0x90, 0x3C, 0x64])
            //Console.WriteLine(BitConverter.ToString(bytes));
            //byte[] b = BitConverter.GetBytes(bytes);
            if (session is not null)
            {
                //Console.WriteLine("sending bytes to session");
                await session.SendMidiAsync(bytes);
            }
        }*/
        //session.SendMidiAsync
    }
}