// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardFooter } from "@/components/ui/card"
// import { Heart, Gavel, ShoppingCart } from "lucide-react"
// // import Image from "next/image"
// // import { cn } from "@/lib/utils"
// // import Link from "next/link"

// interface ProductCardProps {
//   id: string
//   name: string
//   image: string
//   currentPrice: number
//   buyNowPrice?: number
//   topBidder?: string
//   bidCount: number
//   endTime: Date
//   isNew?: boolean
// }

// function formatVietnameseCurrency(amount: number): string {
//   return amount.toLocaleString("vi-VN") + " đ"
// }

// function getTimeDisplay(endTime: Date): {
//   text: string
//   isUrgent: boolean
// } {
//   const now = new Date()
//   const diffMs = endTime.getTime() - now.getTime()
//   const diffMinutes = Math.floor(diffMs / 60000)
//   const diffHours = Math.floor(diffMs / 3600000)
//   const diffDays = Math.floor(diffMs / 86400000)

//   // BR-03: Time Display Logic
//   if (diffMinutes < 60) {
//     // < 1 hour: RED text + Bold
//     return {
//       text: `${diffMinutes} phút`,
//       isUrgent: true,
//     }
//   } else if (diffDays <= 3) {
//     // <= 3 days: Show Relative Time
//     if (diffHours < 24) {
//       return {
//         text: `${diffHours} giờ`,
//         isUrgent: false,
//       }
//     } else {
//       return {
//         text: `${diffDays} ngày`,
//         isUrgent: false,
//       }
//     }
//   } else {
//     // > 3 days: Show Date (dd/mm/yyyy)
//     const day = String(endTime.getDate()).padStart(2, "0")
//     const month = String(endTime.getMonth() + 1).padStart(2, "0")
//     const year = endTime.getFullYear()
//     return {
//       text: `${day}/${month}/${year}`,
//       isUrgent: false,
//     }
//   }
// }

// export function ProductCard({
//   id,
//   name,
//   image,
//   currentPrice,
//   buyNowPrice,
//   topBidder,
//   bidCount,
//   endTime,
//   isNew = false,
// }: ProductCardProps) {
//   const timeDisplay = getTimeDisplay(endTime)

//   return (
//     <Link href={`/product/${id}`} className="block h-full">
//       <Card className="group overflow-hidden transition-all hover:shadow-lg flex flex-col h-full min-w-[280px]">
//         {/* Image Section with 4:3 Aspect Ratio */}
//         <div className="relative aspect-[4/3] overflow-hidden bg-muted">
//           <Image
//             src={image || "/placeholder.svg"}
//             alt={name}
//             fill
//             className="object-cover transition-transform group-hover:scale-105"
//           />

//           {/* NEW Badge - Emerald color, top-left corner */}
//           {isNew && <Badge className="absolute left-2 top-2 bg-emerald-600 hover:bg-emerald-700 text-white">NEW</Badge>}
//         </div>

//         {/* Content Section */}
//         <CardContent className="p-3 flex-1 flex flex-col">
//           {/* Product Name - Truncate after 2 lines */}
//           <h3 className="mb-2 text-base font-semibold line-clamp-2 h-12">{name}</h3>

//           {/* Current Price - Large, Bold, Navy color */}
//           <div className="mb-1.5">
//             <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
//               {formatVietnameseCurrency(currentPrice)}
//             </p>
//           </div>

//           {/* Buy Now Price - Small, gray text with shopping cart icon */}
//           <div className="h-5 mb-1.5">
//             {buyNowPrice && (
//               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
//                 <ShoppingCart className="h-3.5 w-3.5" />
//                 <span>Mua ngay: {formatVietnameseCurrency(buyNowPrice)}</span>
//               </div>
//             )}
//           </div>

//           {/* Top Bidder - BR-01: User Masking */}
//           <div className="h-5">
//             {topBidder && <p className="text-sm text-muted-foreground">Người giữ: {topBidder}</p>}
//           </div>
//         </CardContent>

//         {/* Footer/Status Section */}
//         <CardFooter className="flex items-center justify-between border-t p-3 mt-auto">
//           <div className="flex flex-col gap-0.5">
//             {/* Time Left - Red if < 1 hour (BR-03) */}
//             <p
//               className={cn(
//                 "text-sm font-medium",
//                 timeDisplay.isUrgent ? "text-red-600 font-bold" : "text-muted-foreground",
//               )}
//             >
//               {timeDisplay.text}
//             </p>

//             {/* Bid Count with Gavel icon */}
//             <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
//               <Gavel className="h-3.5 w-3.5" />
//               <span>{bidCount} lượt đấu</span>
//             </div>
//           </div>

//           {/* Add to Watchlist - Heart icon button (Ghost variant) */}
//           <Button
//             variant="ghost"
//             size="icon"
//             className="h-9 w-9 rounded-full hover:text-red-500"
//             aria-label="Thêm vào danh sách theo dõi"
//             onClick={(e) => {
//               e.preventDefault()
//               e.stopPropagation()
//               // Add to watchlist logic here
//             }}
//           >
//             <Heart className="h-5 w-5" />
//           </Button>
//         </CardFooter>
//       </Card>
//     </Link>
//   )
// }
