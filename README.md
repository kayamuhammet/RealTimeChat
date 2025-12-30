# Real Time Chat Application

> ⚠️ **Note:** The **Angular** version of this project has been archived and is available on the `v1-angular` branch. The current `main` branch is actively developed using **React**.

This project is a modern chat application with real-time messaging features. It is developed using .NET Core Web API for the backend and **React (Vite)** for the frontend.

## 🚀 Features

- Real-time messaging (SignalR)
- Simple user authentication (Nickname based)
- General Chat (Public room)
- Private messaging (Direct messages)
- Message history (Persistent storage)
- Online user status (Real-time updates)
- Typing indicators

## 🛠️ Technologies

### Backend

- .NET Core Web API 7.0.11
- Entity Framework Core 7.0.16
- SignalR 1.2.0
- SQLite

### Frontend

- React 18
- TypeScript
- Vite
- @microsoft/signalr (SignalR Client)
- Axios

## 📋 Requirements

- .NET Core 7.0 SDK
- Node.js (v20 or higher)
- npm or yarn
- Visual Studio 2022 or Visual Studio Code

## 🚀 Installation

### Backend Installation

1. Navigate to the ChatApp.Api folder:

```bash
cd ChatApp.Api
```

2. Install dependencies:

```bash
dotnet restore
```

3. Create the database:

```bash
dotnet ef database update
```

4. Run the application:

```bash
dotnet run
```

_The backend will typically start on `http://localhost:5011`._

### Frontend Installation

1. Navigate to the ChatApp.Frontend folder:

```bash
cd ChatApp.Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the application:

```bash
npm run dev
```

_The frontend will typically start on `http://localhost:5173`._

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

## 👥 Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

# Gerçek Zamanlı Sohbet Uygulaması

> ⚠️ **Not:** Bu projenin **Angular** ile yazılmış eski versiyonuna `v1-angular` dalı (branch) üzerinden ulaşabilirsiniz. Şu anki `main` dalı **React** ile geliştirilmektedir.

Bu proje, gerçek zamanlı mesajlaşma özelliklerine sahip modern bir sohbet uygulamasıdır. Backend tarafında .NET Core Web API ve frontend tarafında ise **React (Vite)** kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- Gerçek zamanlı mesajlaşma (SignalR)
- Basit kullanıcı girişi (Takma ad ile)
- Genel Sohbet (Herkese açık oda)
- Özel mesajlaşma (Birebir sohbet)
- Mesaj geçmişi (Kalıcı kayıt)
- Çevrimiçi kullanıcı durumu (Anlık takip)
- "Yazıyor..." göstergesi

## 🛠️ Teknolojiler

### Backend

- .NET Core Web API 7.0.11
- Entity Framework Core 7.0.16
- SignalR 1.2.0
- SQLite

### Frontend

- React 18
- TypeScript
- Vite
- @microsoft/signalr (SignalR İstemcisi)
- Axios

## 📋 Gereksinimler

- .NET Core 7.0 SDK
- Node.js (v20 veya üzeri)
- npm veya yarn
- Visual Studio 2022 veya Visual Studio Code

## 🚀 Kurulum

### Backend Kurulumu

1. ChatApp.Api klasörüne gidin:

```bash
cd ChatApp.Api
```

2. Bağımlılıkları yükleyin:

```bash
dotnet restore
```

3. Veritabanını oluşturun:

```bash
dotnet ef database update
```

4. Uygulamayı çalıştırın:

```bash
dotnet run
```

_Backend genellikle `http://localhost:5011` adresinde çalışacaktır._

### Frontend Kurulumu

1. ChatApp.Frontend klasörüne gidin:

```bash
cd ChatApp.Frontend
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. Uygulamayı çalıştırın:

```bash
npm run dev
```

_Frontend genellikle `http://localhost:5173` adresinde çalışacaktır._

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## 👥 Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Dalınıza push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun
