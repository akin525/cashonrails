import React, { FC } from "react";
import Slider from "react-slick";

type CarouseType = {
    children: React.ReactNode;
    slidesToShow: number;
    slidesToScroll: number;
    autoPlay?: boolean;
    speed?: number;
    onChange?: (value: number) => void;
}

export default function CarouselSlickSlider({ children, slidesToShow, slidesToScroll, autoPlay, speed, onChange }: CarouseType) {
    const settings = {
        dots: false,
        infinite: true,
        speed: speed || 500,
        gap: 10,
        slidesToShow: slidesToShow,
        slidesToScroll: slidesToScroll,
        autoplay: autoPlay ? true : false,
        beforeChange: (currentSlide: number) => {
            onChange && onChange(currentSlide);
        },
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    return (
        <Slider {...settings}>
            {children}
        </Slider>
    );
}