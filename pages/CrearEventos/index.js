import { useState } from "react";
import { useForm } from "react-hook-form";
import CardDate from "../../components/Dates/cardDate";
import {
  inicio,
  cierre,
  convertDate,
  convertirImagen,
  fechaActual,
  fechaMas1,
  validarFecha,
} from "../../components/Dates/manejoFechas";
import { DatePicker } from "antd";
import { Typography } from "antd";
import { Image } from "antd";
import axios from "axios";

export default function CrearEventos() {
  //Estado de la imagen como URL para mostrarla
  const [imagen, setImagen] = useState(null);
  //Estado de la imagen formateada para enviarla
  const [formImagen, setFormImagen] = useState(null);
  //Estado de fecha tanto formateada como para las Cards
  const [fecha, setFecha] = useState({
    inicio: { ...inicio },
    inicioFormt: fechaActual,
    cierre: { ...cierre },
    cierreFormt: fechaMas1,
    error: false,
  });
  //Estado del input de fecha solo para mostrarlo
  const [inputFecha, setInputFecha] = useState({
    inicio: null,
    cierre: null,
  });
  //Hook Form con el estado de todos los inputs del formulario
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { Title } = Typography;
  //SetValue de la fecha de incio, tanto la del input como para la Card
  const onChangeInicio = (date) => {
    const dates = convertDate(date);

    setFecha({
      ...fecha,
      inicio: date ? { ...dates } : inicio,
      inicioFormt: date ? date._d : fechaActual,
    });
    setInputFecha({
      ...inputFecha,
      inicio: date ? date : null,
    });
  };
  //SetValue de la fecha de cierre, tanto la del input como para la Card
  const onChangeCierre = (date) => {
    const dates = convertDate(date);
    setFecha({
      ...fecha,
      cierre: date ? { ...dates } : cierre,
      cierreFormt: date ? date._d : fechaMas1,
    });
    setInputFecha({
      ...inputFecha,
      cierre: date ? date : null,
    });
  };

  //Se valida ue la fecha inicial sea menor ue la final
  const valFecha = () => {
    const valida = validarFecha(fecha.inicio, fecha.cierre);
    if (!valida) {
      setFecha({
        ...fecha,
        error: true,
      });
      return false;
    } else {
      setFecha({
        ...fecha,
        error: false,
      });
      return true;
    }
  };

  //Envio de datos del evento
  const onSubmit = async (data, e) => {
    const valida = valFecha();
    if (!valida) {
      return;
    }

    const formdata = convertirImagen(formImagen);

    try {
      const idImagen = await axios.post("/api/imagen", formdata);

      if (idImagen.status === 200) {
        const body = {
          titulo: data.titulo,
          fecha_inicial: fecha.inicioFormt,
          fecha_final: fecha.cierreFormt,
          num_boletas: parseInt(data.boletas),
          aforo: parseInt(data.aforo),
          descripcion: data.descripcion,
          lugar: data.lugar,
          anfitrion: data.anfitrion,
          tematica: data.tematica,
          direccion: data.direccion,
          id_imagen: idImagen.data.id_imagen,
        };

        const respuesta = await axios.post("/api/evento", body);

        alert(respuesta.data);
        resetValues(e);
      } else {
        alert("No se pudo enviar la imagen, intente de nuevo");
      }
    } catch (e) {
      alert(e);
    }
  };
  //Reset de todos los datos
  const resetValues = (e) => {
    setImagen(null);
    setFormImagen(null);
    setFecha({
      ...fecha,
      inicio: { ...inicio },
      inicioFormt: fechaActual,
      cierre: { ...cierre },
      cierreFormt: fechaMas1,
    });
    setInputFecha({
      inicio: null,
      cierre: null,
    });
    e.target.reset();
  };

  return (
    <div className="crearEV_Container">
      <div className="titulo">
        <Title level={2}>Crear Eventos</Title>
      </div>
      <div className="contend">
        <form
          className="form-eventos"
          id="formEvento"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            className="input-title"
            placeholder="Titulo del Evento"
            {...register("titulo", { required: true })}
          />
          {errors.titulo && (
            <span className="spanError errorTitle">
              Este campo es obligatorio
            </span>
          )}
          <hr className="event-hr" />
          <div className="cont-options">
            <div className="cont-options-img">
              <div className="cont-img">
                <Image
                  preview={false}
                  width="100%"
                  height="100%"
                  src={
                    imagen ||
                    "https://i.pinimg.com/originals/50/f6/0a/50f60a6eb9966f0cbbfa8ef052b0d3ed.jpg"
                  }
                  alt="Imagen del Evento"
                />
              </div>
              <input
                className="input-img"
                type="file"
                name="imagen"
                accept="image/*"
                onChange={(e) => {
                  setFormImagen(e.target.files[0]);
                  setImagen(URL.createObjectURL(e.target.files[0]));
                }}
              />
            </div>
            <div className="options-right">
              <div className="options-right-h3 ">
                <div className="contenedorDate">
                  <div className="right-date">
                    <Title level={4}>Inicio</Title>

                    <CardDate {...fecha.inicio} />
                  </div>
                  <div className="fecha">
                    <DatePicker
                      id="fechaInicio"
                      name="inicio"
                      value={inputFecha.inicio}
                      onChange={onChangeInicio}
                      className="place-pick"
                      locale="es"
                      placeholder="Fecha Incial"
                      showTime
                    />
                  </div>
                </div>
                {fecha.error && (
                  <span className="spanError">
                    La fecha inicial debe ser antes de la de cierre
                  </span>
                )}
                <div className="contenedorDate">
                  <div className="right-date">
                    <Title level={4}>Cierre</Title>

                    <CardDate {...fecha.cierre} />
                  </div>
                  <div className="fecha">
                    <DatePicker
                      id="fechaCierre"
                      name="cierre"
                      value={inputFecha.cierre}
                      onChange={onChangeCierre}
                      className="place"
                      placeholder="Fecha Cierre"
                      showTime
                      locale="es"
                    />
                  </div>
                </div>
              </div>
              <div className="right-inputs">
                <Title level={3}>Información General</Title>
                <div className="contenedor-inputs">
                  <div className="inputs-info">
                    <div className="inputs-info-right">
                      <label htmlFor="lugar">{"Lugar: (*)"}</label>
                      <input
                        id="lugar"
                        name="lugar"
                        className="inputs-Eventos"
                        {...register("lugar", { required: true })}
                      />
                      {errors.lugar && (
                        <span className="spanError">
                          Este campo es obligatorio
                        </span>
                      )}
                      <label htmlFor="tematica">{"Tematica: (*)"}</label>
                      <input
                        id="tematica"
                        name="tematica"
                        className="inputs-Eventos"
                        {...register("tematica", { required: true })}
                      />
                      {errors.tematica && (
                        <span className="spanError">
                          Este campo es obligatorio
                        </span>
                      )}
                      <label htmlFor="direccion">{"Dirección: "}</label>
                      <input
                        id="direccion"
                        name="direccion"
                        className="inputs-Eventos"
                        {...register("direccion")}
                      />
                    </div>
                    <div className="inputs-info-left">
                      <label htmlFor="aforo">{"Aforo: (*)"}</label>
                      <input
                        id="aforo"
                        className="inputs-Eventos"
                        type="number"
                        name="aforo"
                        {...register("aforo", { required: true })}
                      />
                      {errors.aforo && (
                        <span className="spanError">
                          Este campo es obligatorio
                        </span>
                      )}
                      <label htmlFor="boletas">
                        {"Boletas Permitidas: (*)"}
                      </label>
                      <input
                        id="boletas"
                        className="inputs-Eventos"
                        type="number"
                        name="boletas"
                        {...register("boletas", { required: true })}
                      />
                      {errors.boletas && (
                        <span className="spanError">
                          Este campo es obligatorio
                        </span>
                      )}

                      <label htmlFor="anfitrion">{"Anfitrión: "}</label>
                      <input
                        id="anfitrion"
                        name="anfitrion"
                        className="inputs-Eventos"
                        {...register("anfitrion")}
                      />
                    </div>
                  </div>
                  <textarea
                    className="input-textarea"
                    placeholder="Descripción"
                    name="descripcion"
                    {...register("descripcion")}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <button
        className="button-crearEv"
        type="submit"
        size="small"
        form="formEvento"
      >
        Crear Evento
      </button>
    </div>
  );
}
