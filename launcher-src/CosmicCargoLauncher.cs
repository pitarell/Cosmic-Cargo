using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

internal static class CosmicCargoLauncher
{
    [STAThread]
    private static void Main()
    {
        string root = AppDomain.CurrentDomain.BaseDirectory;
        string game = Path.Combine(root, "app", "index.html");

        if (!File.Exists(game))
        {
            MessageBox.Show(
                "O arquivo app\\index.html não foi encontrado. Mantenha o executável na pasta principal do Cosmic Cargo.",
                "Cosmic Cargo",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            return;
        }

        try
        {
            Process.Start(new ProcessStartInfo(game) { UseShellExecute = true });
        }
        catch (Exception error)
        {
            MessageBox.Show(
                "Não foi possível abrir o jogo no navegador padrão.\n\n" + error.Message,
                "Cosmic Cargo",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
    }
}
